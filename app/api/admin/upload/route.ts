import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabaseAdmin, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";
import sharp from "sharp";
import path from "path";
import os from "os";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const IMAGE_TYPES = ["image/webp", "image/png", "image/jpeg", "image/jpg", "image/gif", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

async function compressImage(input: Buffer): Promise<{ buffer: Buffer; contentType: string }> {
  const compressed = await sharp(input)
    .resize({ width: 1920, height: 1080, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  return { buffer: Buffer.from(compressed), contentType: "image/webp" };
}

async function compressVideo(inputBuffer: Buffer, originalName: string): Promise<Buffer> {
  // Dynamic import to avoid edge runtime issues
  const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");
  const ffmpeg = (await import("fluent-ffmpeg")).default;
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  const tmpDir = os.tmpdir();
  const ext = originalName.split(".").pop() ?? "mp4";
  const inputPath = path.join(tmpDir, `hok_in_${Date.now()}.${ext}`);
  const outputPath = path.join(tmpDir, `hok_out_${Date.now()}.mp4`);

  await fs.writeFile(inputPath, inputBuffer);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions([
        "-crf 28",          // qualidade (18=alta, 28=boa, 35=baixa)
        "-preset fast",     // velocidade de compressão
        "-vf scale=1280:-2", // máximo 720p
        "-movflags faststart", // otimiza para streaming web
        "-pix_fmt yuv420p",
      ])
      .on("end", () => resolve())
      .on("error", reject)
      .save(outputPath);
  });

  const compressed = await fs.readFile(outputPath);

  // Limpa arquivos temporários
  await fs.unlink(inputPath).catch(() => {});
  await fs.unlink(outputPath).catch(() => {});

  return compressed;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const filePath = formData.get("path") as string;

  if (!file || !filePath) {
    return NextResponse.json({ error: "file e path obrigatórios" }, { status: 400 });
  }

  const isImage = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type) || file.type === "";

  if (!isImage && !isVideo) {
    return NextResponse.json({ error: `Tipo inválido: ${file.type}` }, { status: 400 });
  }

  if (file.size > 200 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (máx 200MB)" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  let buffer: Buffer = Buffer.from(new Uint8Array(arrayBuffer));
  let contentType = file.type;
  let finalPath = filePath;

  const originalSizeMB = (buffer.length / 1024 / 1024).toFixed(1);

  try {
    if (isImage) {
      const result = await compressImage(buffer);
      buffer = result.buffer;
      contentType = result.contentType;
      // Troca extensão para .webp
      finalPath = filePath.replace(/\.[^.]+$/, ".webp");
    } else if (isVideo) {
      buffer = await compressVideo(buffer, file.name);
      contentType = "video/mp4";
      finalPath = filePath.replace(/\.[^.]+$/, ".mp4");
    }
  } catch (err) {
    console.error("Compression error:", err);
    // Se compressão falhar, faz upload sem comprimir
  }

  const compressedSizeMB = (buffer.length / 1024 / 1024).toFixed(1);
  console.log(`Upload: ${file.name} | ${originalSizeMB}MB → ${compressedSizeMB}MB`);

  const { error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(finalPath, buffer, { upsert: true, contentType });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const url = getPublicUrl(finalPath);
  return NextResponse.json({ url, originalSizeMB, compressedSizeMB });
}
