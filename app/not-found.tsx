import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl font-black text-gold-400 mb-4">404</p>
        <h1 className="text-xl font-bold text-white mb-2">Página não encontrada</h1>
        <p className="text-gray-500 text-sm mb-6">O herói ou página que você procura não existe.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-sm px-5 py-2.5 rounded-lg transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
