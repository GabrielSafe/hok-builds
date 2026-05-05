import AssetManager from "@/components/admin/AssetManager";

export const dynamic = "force-dynamic";

export default function AdminSpellsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-2">Feitiços</h1>
      <p className="text-gray-500 text-sm mb-6">Cadastre os feitiços de invocador.</p>
      <AssetManager title="Feitiço" apiPath="spells" storageFolder="spells" />
    </div>
  );
}
