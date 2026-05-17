import AssetManager from "@/components/admin/AssetManager";
import ArcanaAttributeEditor from "@/components/admin/ArcanaAttributeEditor";

export const dynamic = "force-dynamic";

export default function AdminArcanaPage() {
  return (
    <div className="p-6 space-y-12">
      <div>
        <h1 className="text-xl font-bold text-white mb-2">Arcana</h1>
        <p className="text-gray-500 text-sm mb-6">Cadastre as arcanas para usar nas builds.</p>
        <AssetManager title="Arcana" apiPath="arcana" storageFolder="arcana" extraFields="tier" />
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-1">Atributos das Arcanas</h2>
        <p className="text-gray-500 text-sm mb-6">
          Defina os atributos de cada arcana. Os valores são multiplicados pela quantidade usada na build.
        </p>
        <ArcanaAttributeEditor />
      </div>
    </div>
  );
}
