import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ImpactEvent } from '../types';
import { Calendar, MapPin, Clock, Trash2, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Events() {
  const [events, setEvents] = useState<ImpactEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'), limit(12));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImpactEvent));
        setEvents(docs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const totalKg = events.reduce((acc, curr) => acc + curr.totalCollectedKg, 0) || 0; // Fallback for demo

  return (
    <div className="space-y-16 pb-20">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-[#FF8C00] rounded-3xl mx-auto flex items-center justify-center mb-8 rotate-12 shadow-[0_0_40px_rgba(255,140,0,0.2)]"
        >
          <Trash2 size={40} className="text-black" />
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase">
          DIA 27 É DIA DE <span className="text-[#FF8C00]">MUDANÇA</span>.
        </h1>
        <p className="mt-6 text-xl text-zinc-400">
          Nossa missão é garantir que nenhum eletrônico termine em aterros sanitários. Junte-se ao movimento ZeroVinTTech.
        </p>
      </section>

      {/* Impact Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center space-y-2">
          <TrendingUp size={32} className="text-[#FF8C00] mx-auto mb-4" />
          <p className="text-5xl font-black tracking-tighter text-white">{totalKg}kg</p>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lixo Coletado</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center space-y-2">
          <Calendar size={32} className="text-[#FF8C00] mx-auto mb-4" />
          <p className="text-5xl font-black tracking-tighter text-white">Mensal</p>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Frequência de Coleta</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center space-y-2">
          <MapPin size={32} className="text-[#FF8C00] mx-auto mb-4" />
          <p className="text-5xl font-black tracking-tighter text-white">Unisales</p>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ponto de Encontro</p>
        </div>
      </section>

      {/* Next Event Info */}
      <section className="bg-zinc-900 rounded-3xl overflow-hidden border border-[#FF8C00]/30 flex flex-col md:flex-row">
        <div className="p-8 md:p-12 flex-grow space-y-8">
          <div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-4">Próximo Evento</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-zinc-300">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-zinc-800">
                  <Calendar size={20} className="text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Data</p>
                  <p className="font-bold">Todo dia 27 útil de cada mês</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-zinc-300">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-zinc-800">
                  <Clock size={20} className="text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Horário</p>
                  <p className="font-bold text-2xl text-[#FF8C00]">20:20</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-zinc-300">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-zinc-800">
                  <MapPin size={20} className="text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Local</p>
                  <p className="font-bold">Unisales (Perto da Capela)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black/50 p-6 rounded-2xl border border-zinc-800">
            <h4 className="font-bold mb-2 flex items-center space-x-2">
              <Info size={18} className="text-[#FF8C00]" />
              <span>O que posso levar?</span>
            </h4>
            <p className="text-sm text-zinc-400">
              Aceitamos mouses, teclados, cabos, monitores, celulares, baterias, placas de circuito e qualquer outro componente eletrônico que não tenha mais utilidade.
            </p>
          </div>
        </div>
        <div className="md:w-1/3 bg-[#FF8C00] p-12 flex flex-col justify-center text-black">
          <h3 className="text-4xl font-black tracking-tighter uppercase leading-none mb-6">Não jogue fora o futuro.</h3>
          <p className="font-bold mb-8 opacity-80">O descarte incorreto libera metais pesados no solo. Recicle com a gente.</p>
          <div className="w-full h-1 bg-black/20 mb-8"></div>
          <p className="text-xs font-black uppercase tracking-[0.2em]">ZeroVinTTech Impact</p>
        </div>
      </section>

      {/* History */}
      <section>
        <h2 className="text-2xl font-bold mb-8 flex items-center space-x-2">
          <div className="w-2 h-8 bg-[#FF8C00] rounded-full"></div>
          <span>Histórico de Impacto</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-[#FF8C00]/20 transition-colors">
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              <p className="text-3xl font-black tracking-tighter text-[#FF8C00]">{event.totalCollectedKg}kg</p>
              <p className="text-xs text-zinc-400 mt-1">Coletados na Unisales</p>
            </div>
          ))}
          {events.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              Iniciando registros de impacto...
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
