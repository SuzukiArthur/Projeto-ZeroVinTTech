import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Donation, DonationCategory } from '../types';
import DonationCard from '../components/DonationCard';
import { Filter, ArrowRight, Zap, Recycle, Users, ShieldCheck, Package, Laptop, Smartphone, Gamepad2, Cpu, MousePointer2, Network, Monitor } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory | 'all'>('all');

  const categories: { id: DonationCategory | 'all', label: string, icon: any }[] = [
    { id: 'all', label: 'Todos', icon: Filter },
    { id: 'periferico', label: 'Periférico', icon: MousePointer2 },
    { id: 'componente eletronico', label: 'Componente', icon: Cpu },
    { id: 'notebook', label: 'Notebook', icon: Laptop },
    { id: 'celular', label: 'Celular', icon: Smartphone },
    { id: 'videogame', label: 'Videogame', icon: Gamepad2 },
    { id: 'pc', label: 'PC Desktop', icon: Monitor },
    { id: 'rede', label: 'Rede', icon: Network },
  ];

  const seedData = () => {
    const samples: Donation[] = [
      {
        id: 'seed-1',
        title: "Mouse Gamer Logitech G203",
        description: "Mouse em perfeito estado, pouco uso. Acompanha caixa original.",
        category: "periferico",
        condition: "Usado - Bom",
        photos: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"],
        donorName: "Carlos Silva",
        donorId: "system-seed-1",
        status: "available",
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-2',
        title: "Teclado Mecânico Redragon",
        description: "Switch azul, funcionando perfeitamente. Ideal para quem está começando a programar.",
        category: "periferico",
        condition: "Usado - Bom",
        photos: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=800"],
        donorName: "Ana Oliveira",
        donorId: "system-seed-2",
        status: "available",
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-3',
        title: "Monitor Samsung 24' Curvo",
        description: "Pequeno detalhe na carcaça, mas a tela está 100%. Ótimo para produtividade.",
        category: "periferico",
        condition: "Usado - Bom",
        photos: ["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"],
        donorName: "Bruno Santos",
        donorId: "system-seed-3",
        status: "available",
        createdAt: new Date().toISOString()
      },
      {
        id: 'seed-4',
        title: "Placa de Vídeo GTX 1050 Ti",
        description: "Funcionando perfeitamente, ideal para estudos de renderização.",
        category: "componente eletronico",
        condition: "Usado - Bom",
        photos: ["https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800"],
        donorName: "Mariana Lima",
        donorId: "system-seed-4",
        status: "available",
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('mockDonations', JSON.stringify(samples));
    window.location.reload();
  };

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const mockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
        
        let realDocs: Donation[] = [];
        try {
          const q = query(
            collection(db, 'donations'),
            where('status', '!=', 'donated'),
            orderBy('status'),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
          const querySnapshot = await getDocs(q);
          realDocs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
        } catch (e) {
          console.log('Firestore not configured, using mock data only');
        }

        const allDonations = [...mockDonations, ...realDocs].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setDonations(allDonations);
        setFilteredDonations(allDonations);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredDonations(donations);
    } else {
      setFilteredDonations(donations.filter(d => d.category === selectedCategory));
    }
  }, [selectedCategory, donations]);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-[40px] bg-zinc-950 border border-zinc-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF8C00] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF8C00] rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-full mb-8"
          >
            <Zap size={16} className="text-[#FF8C00]" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Economia Circular na Unisales</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
          >
            DOE TECNOLOGIA.<br />
            <span className="text-[#FF8C00]">CRIE FUTURO.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            A plataforma exclusiva para alunos da Unisales doarem eletrônicos. 
            O que é lixo para você, pode ser a ferramenta de estudo de outro colega.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              to="/create-donation" 
              className="w-full sm:w-auto bg-[#FF8C00] text-black px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,140,0,0.2)]"
            >
              QUERO DOAR AGORA
            </Link>
            <a 
              href="#explore" 
              className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl font-black text-lg border border-zinc-800 hover:bg-zinc-800 transition-all"
            >
              EXPLORAR DOAÇÕES
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
          <div className="w-12 h-12 bg-[#FF8C00]/10 rounded-2xl flex items-center justify-center">
            <Recycle className="text-[#FF8C00]" size={24} />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-tighter">Sustentabilidade</h3>
          <p className="text-zinc-500 text-sm">Reduza o lixo eletrônico no campus e ajude o meio ambiente através do reuso.</p>
        </div>
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
          <div className="w-12 h-12 bg-[#FF8C00]/10 rounded-2xl flex items-center justify-center">
            <Users className="text-[#FF8C00]" size={24} />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-tighter">Comunidade</h3>
          <p className="text-zinc-500 text-sm">Conecte-se com outros estudantes da Unisales e fortaleça nossa rede acadêmica.</p>
        </div>
        <div className="p-8 rounded-3xl bg-zinc-900/30 border border-zinc-900 space-y-4">
          <div className="w-12 h-12 bg-[#FF8C00]/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-[#FF8C00]" size={24} />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-tighter">Segurança</h3>
          <p className="text-zinc-500 text-sm">Trocas realizadas dentro do campus, garantindo segurança para quem doa e recebe.</p>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase">Disponíveis para <span className="text-[#FF8C00]">você</span></h2>
            <p className="text-zinc-500 mt-2">Confira os últimos itens postados pela comunidade.</p>
          </div>
          <div className="flex items-center space-x-4">
            {donations.length === 0 && !loading && (
              <button 
                onClick={seedData}
                className="text-xs font-bold uppercase tracking-widest text-[#FF8C00] border border-[#FF8C00]/30 px-4 py-2 rounded-full hover:bg-[#FF8C00]/10 transition-colors"
              >
                Gerar Exemplos
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex overflow-x-auto pb-6 mb-8 scrollbar-hide gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border ${
                selectedCategory === cat.id 
                  ? 'bg-[#FF8C00] text-black border-[#FF8C00] shadow-[0_10px_20px_rgba(255,140,0,0.2)]' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <cat.icon size={18} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-zinc-900 h-80 rounded-[32px] animate-pulse"></div>
            ))}
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDonations.map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[40px] border border-dashed border-zinc-800">
            <Package className="mx-auto text-zinc-700 mb-4" size={48} />
            <p className="text-zinc-500 font-bold uppercase tracking-widest">Nenhuma doação encontrada nesta categoria.</p>
            <p className="text-zinc-600 text-sm mt-2">Tente mudar o filtro ou seja o primeiro a doar!</p>
            <Link to="/create-donation" className="mt-8 inline-block text-[#FF8C00] font-bold hover:underline">
              Começar uma doação
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-[#FF8C00] rounded-[40px] p-12 md:p-20 text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Tem algo parado na gaveta?
            </h2>
            <p className="mt-6 text-xl font-medium opacity-90">
              Aquele mouse antigo ou cabo que você não usa mais pode ser exatamente o que um colega precisa para terminar um trabalho.
            </p>
          </div>
          <Link 
            to="/create-donation" 
            className="bg-black text-white px-12 py-6 rounded-2xl font-black text-xl flex items-center space-x-3 hover:scale-105 transition-transform"
          >
            <span>DOAR AGORA</span>
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>
    </div>
  );
}
