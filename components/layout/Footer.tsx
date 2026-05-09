import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-dark-600 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col items-center text-center gap-8">

        {/* Logo + descrição */}
        <div className="flex flex-col items-center gap-3">
          <Image src="/logo.png" alt="HOK Builds" width={140} height={30} className="h-7 w-auto object-contain" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
            Guias e builds para todos os heróis de Honor of Kings. Domine o campo de batalha.
          </p>
        </div>

        {/* Navegação */}
        <div className="flex flex-col items-center gap-2">
          <h4 className="text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">Navegação</h4>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-400">
            <Link href="/" className="hover:text-gold-400 transition-colors">Início</Link>
            <Link href="/heroes" className="hover:text-gold-400 transition-colors">Heróis</Link>
            <Link href="/tier-list" className="hover:text-gold-400 transition-colors">Tier List</Link>
            <Link href="/builds" className="hover:text-gold-400 transition-colors">Builds</Link>
            <Link href="/guides" className="hover:text-gold-400 transition-colors">Guias</Link>
          </div>
        </div>

        {/* Legal */}
        <p className="text-gray-600 text-xs leading-relaxed max-w-md">
          HOK Builds não é afiliado à TiMi Studio Group ou Level Infinite.
          Honor of Kings é uma marca registrada de seus respectivos proprietários.
        </p>
      </div>

      <div className="border-t border-dark-600 px-4 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} HOK Builds. Todos os direitos reservados.
      </div>
    </footer>
  );
}
