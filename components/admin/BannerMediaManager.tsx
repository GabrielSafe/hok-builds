"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Trash2, Eye, EyeOff, Film, ImageIcon } from "lucide-react";

interface BannerMedia {
  id: number;
  url: string;
  type: string;
  title: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  initialMedia: BannerMedia[];
}

export default function BannerMediaManager({ initialMedia }: Props) {
  const [media, setMedia] = useState<BannerMedia[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);

    const isVideo = file.type.startsWith("video/");
    const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
    const storagePath = `banners/${Date.now()}.${ext}`;

    setProgress(30);

    // URL assinada
    const urlRes = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: storagePath }),
    });
    const { signedUrl, publicUrl } = await urlRes.json();

    setProgress(60);

    // Upload direto para Supabase
    await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    setProgress(85);

    // Registra no banco
    const res = await fetch("/api/admin/banner-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: publicUrl, type: isVideo ? "video" : "image", title: title || file.name }),
    });
    const newItem = await res.json();

    setMedia(prev => [...prev, newItem]);
    setTitle("");
    setProgress(100);
    setTimeout(() => { setUploading(false); setProgress(0); }, 500);
    e.target.value = "";
  }

  async function toggleActive(item: BannerMedia) {
    await fetch(`/api/admin/banner-media/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, is_active: !item.is_active }),
    });
    setMedia(prev => prev.map(m => m.id === item.id ? { ...m, is_active: !m.is_active } : m));
  }

  async function deleteItem(id: number) {
    if (!confirm("Remover esta mídia?")) return;
    await fetch(`/api/admin/banner-media/${id}`, { method: "DELETE" });
    setMedia(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-4 space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título (opcional)"
            className="input flex-1 text-sm"
            disabled={uploading}
          />
          <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-colors shrink-0 ${uploading ? "bg-dark-600 text-gray-500" : "bg-gold-500 hover:bg-gold-400 text-dark-900"}`}>
            <input
              type="file"
              accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/gif"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
            <Upload size={14} />
            {uploading ? `Enviando ${progress}%` : "Enviar Mídia"}
          </label>
        </div>
        {uploading && (
          <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
            <div className="h-full bg-gold-500 transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        )}
        <p className="text-[10px] text-gray-600">Aceita: .mp4, .webm, .gif, .jpg, .png, .webp — sem limite de tamanho</p>
      </div>

      {/* Lista */}
      {media.length === 0 ? (
        <div className="bg-dark-700 border border-dark-600 rounded-xl px-5 py-8 text-center text-sm text-gray-500">
          Nenhuma mídia — o splash dos heróis será usado como fundo.
        </div>
      ) : (
        <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
          <div className="divide-y divide-dark-600">
            {media.map((item, idx) => (
              <div key={item.id} className={`flex items-center gap-4 px-5 py-3 ${!item.is_active ? "opacity-50" : ""}`}>
                <div className="w-20 h-12 rounded-lg overflow-hidden bg-dark-600 border border-dark-500 shrink-0 flex items-center justify-center">
                  {item.type === "video"
                    ? <video src={item.url} className="w-full h-full object-cover" muted />
                    : <Image src={item.url} alt={item.title ?? ""} fill className="object-cover" sizes="160px" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {item.type === "video" ? <Film size={11} className="text-blue-400" /> : <ImageIcon size={11} className="text-green-400" />}
                    <p className="text-sm text-white truncate">{item.title ?? "Sem título"}</p>
                  </div>
                  <p className="text-[10px] text-gray-500">#{idx + 1} — {item.type === "video" ? "Vídeo" : "Imagem"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(item)} className={`p-1.5 rounded transition-colors ${item.is_active ? "text-green-400" : "text-gray-600"}`}>
                    {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-1.5 rounded text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
