import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-dark-600 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <span className="text-dark-900 font-black text-xs">HOK</span>
            </div>
            <span className="font-bold text-white">HOK <span className="text-gold-400">Builds</span></span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Guias e builds para todos os heróis de Honor of Kings. Domine o campo de batalha.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">Navegação</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-gold-400 transition-colors">Início</Link></li>
            <li><Link href="/heroes" className="hover:text-gold-400 transition-colors">Heróis</Link></li>
            <li><Link href="/tier-list" className="hover:text-gold-400 transition-colors">Tier List</Link></li>
            <li><Link href="/builds" className="hover:text-gold-400 transition-colors">Builds</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-3">Legal</h4>
          <p className="text-gray-500 text-xs leading-relaxed">
            HOK Builds não é afiliado à TiMi Studio Group ou Level Infinite.
            Honor of Kings é uma marca registrada de seus respectivos proprietários.
          </p>
        </div>
      </div>

      <div className="border-t border-dark-600 px-4 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} HOK Builds. Todos os direitos reservados.
      </div>
    </footer>
  );
}
