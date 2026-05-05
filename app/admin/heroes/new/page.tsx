import HeroForm from "@/components/admin/HeroForm";

export default function NewHeroPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-white mb-6">Novo Herói</h1>
      <HeroForm />
    </div>
  );
}
