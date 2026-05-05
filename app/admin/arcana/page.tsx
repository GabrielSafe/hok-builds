import AssetManager from "@/components/admin/AssetManager";

export const dynamic = "force-dynamic";

export default function AdminArcanaPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-2">Arcana</h1>
      <p className="text-gray-500 text-sm mb-6">Cadastre as arcanas para usar nas builds.</p>
      <AssetManager title="Arcana" apiPath="arcana" storageFolder="arcana" extraFields="tier" />
    </div>
  );
}
