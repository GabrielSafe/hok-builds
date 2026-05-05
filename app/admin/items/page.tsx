import AssetManager from "@/components/admin/AssetManager";

export const dynamic = "force-dynamic";

export default function AdminItemsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-2">Itens</h1>
      <p className="text-gray-500 text-sm mb-6">Cadastre os itens do jogo para usar nas builds.</p>
      <AssetManager title="Item" apiPath="items" storageFolder="items" extraFields="cost" />
    </div>
  );
}
