"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Trash2, Eye, EyeOff, Film, ImageIcon } from "lucide-react";

interface BannerMedia {
  id: number;
  url: string;
  type: "video" | "image";
  title: string | null;
  sort_order: number;
  is_active: boolean;
}

export default function AdminBannerMediaPage() {
  const [media, setMedia] = useState<BannerMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/banner-media");
    setMedia(await res.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const isVideo = file.type.startsWith("video/");
    const isGif = file.type === "image/gif";
    const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
    const storagePath = `banners/${Date.now()}.${ext}`;

    // 1. Pede URL assinada ao servidor (sem enviar o arquivo)
    const urlRes = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: storagePath }),
    });
    const { signedUrl, publicUrl } = await urlRes.json();

    // 2. Upload direto para o Supabase (sem passar pelo Next.js)
    await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    // 3. Registra no banco
    await fetch("/api/admin/banner-media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: publicUrl,
        type: isVideo ? "video" : "image",
        title: title || file.name,
      }),
    });

    setTitle("");
    setUploading(false);
    load();
    e.target.value = "";
  }

  async function toggleActive(item: BannerMedia) {
    await fetch(`/api/admin/banner-media/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, is_active: !item.is_active }),
    });
    load();
  }

  async function deleteItem(id: number) {
    if (!confirm("Remover esta mídia?")) return;
    await fetch(`/api/admin/banner-media/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-xl font-bold text-white mb-1">Mídia do Banner</h1>
      <p className="text-gray-500 text-sm mb-6">
        Vídeos e fotos que aparecem como fundo da página inicial. Suportado: .mp4, .webm, .jpg, .png, .webp
      </p>

      {/* Upload */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl p-5 mb-6 space-y-3">
        <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Adicionar Mídia</p>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Título (opcional)</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Gameplay HoK Season 5"
            className="input"
          />
        </div>

        <label className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${uploading ? "border-gold-500/50 opacity-50" : "border-dark-500 hover:border-gold-500/50"}`}>
          <input
            type="file"
            accept="video/mp4,video/webm,image/jpeg,image/png,image/webp,image/gif"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Upload size={20} className="text-gold-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-white">
              {uploading ? "Enviando..." : "Clique para selecionar arquivo"}
            </p>
            <p className="text-xs text-gray-500">Vídeo (.mp4, .webm) ou Imagem (.jpg, .png, .webp) — máx. 50MB</p>
          </div>
        </label>
      </div>

      {/* List */}
      <div className="bg-dark-700 border border-dark-600 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-dark-600 flex items-center justify-between">
          <p className="text-xs font-bold text-gold-400 uppercase tracking-wider">Mídia Cadastrada ({media.length})</p>
          <p className="text-xs text-gray-500">{media.filter(m => m.is_active).length} ativa(s)</p>
        </div>

        {media.length === 0 && (
          <div className="px-5 py-10 text-center text-gray-500 text-sm">
            Nenhuma mídia cadastrada. Faça upload de um vídeo ou foto acima.
          </div>
        )}

        <div className="divide-y divide-dark-600">
          {media.map((item, idx) => (
            <div key={item.id} className={`flex items-center gap-4 px-5 py-4 ${!item.is_active ? "opacity-50" : ""}`}>
              {/* Thumbnail */}
              <div className="w-20 h-12 rounded-lg overflow-hidden bg-dark-600 border border-dark-500 shrink-0 flex items-center justify-center">
                {item.type === "video" ? (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.title ?? ""} className="w-full h-full object-cover" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {item.type === "video"
                    ? <Film size={12} className="text-blue-400 shrink-0" />
                    : <ImageIcon size={12} className="text-green-400 shrink-0" />
                  }
                  <p className="text-sm font-semibold text-white truncate">{item.title ?? "Sem título"}</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">#{idx + 1} — {item.type === "video" ? "Vídeo" : "Imagem"}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleActive(item)}
                  title={item.is_active ? "Desativar" : "Ativar"}
                  className={`p-2 rounded-lg transition-colors ${item.is_active ? "text-green-400 hover:bg-green-900/20" : "text-gray-600 hover:bg-dark-600"}`}
                >
                  {item.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
