export default function Footer() {
  return (
    <footer className="bg-black border-t border-[#FF8C00]/10 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-400">
            © 2026 <span className="text-[#FF8C00] font-semibold">ZeroVinTTech</span>. Todos os direitos reservados.
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-[#FF8C00] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[#FF8C00] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#FF8C00] transition-colors">Unisales</a>
          </div>
          <div className="text-xs text-gray-500 italic">
            "Sustentabilidade e tecnologia em um só lugar."
          </div>
        </div>
      </div>
    </footer>
  );
}
