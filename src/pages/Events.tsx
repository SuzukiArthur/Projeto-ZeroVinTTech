import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { ImpactEvent } from '../types';
import { Calendar, MapPin, Clock, Trash2, TrendingUp, Info, Users, Award, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export default function Events() {
  const [events, setEvents] = useState<ImpactEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Guarantee the April 27th event with 11.3 kg is seeded as baseline
  const baselineEvents: ImpactEvent[] = [
    {
      id: 'event-27-04',
      date: '2026-04-27',
      totalCollectedKg: 11.3
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('date', 'desc'), limit(12));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImpactEvent));
        
        // Merge fetched docs with baseline seed, uniqueing by ID
        const merged = [...baselineEvents];
        docs.forEach(doc => {
          if (!merged.some(m => m.id === doc.id)) {
            merged.push(doc);
          }
        });
        
        // Sort merged events by date descending
        merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEvents(merged);
      } catch (err) {
        console.error('Error fetching events, using baseline seed:', err);
        setEvents(baselineEvents);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const totalKg = events.reduce((acc, curr) => acc + curr.totalCollectedKg, 0) || 11.3;

  const rankingCursos = [
    { nome: 'TADS (Análise e Des. de Sistemas)', percent: 100, doado: '1º Lugar' },
    { nome: 'Psicologia', percent: 85, doado: '2º Lugar' },
    { nome: 'Nutrição', percent: 70, doado: '3º Lugar' },
    { nome: 'Educação Física', percent: 60, doado: '4º Lugar' },
    { nome: 'Sistemas de Informação', percent: 45, doado: '5º Lugar' },
    { nome: 'Engenharia de Software', percent: 30, doado: '6º Lugar' },
  ];

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
          <p className="text-5xl font-black tracking-tighter text-white">{totalKg.toFixed(1)}kg</p>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lixo Coletado</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center space-y-2">
          <Calendar size={32} className="text-[#FF8C00] mx-auto mb-4" />
          <p className="text-5xl font-black tracking-tighter text-white">Todo Dia 27</p>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Frequência de Coleta</p>
        </div>
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center space-y-2">
          <MapPin size={32} className="text-[#FF8C00] mx-auto mb-4" />
          <p className="text-5xl font-black tracking-tighter text-white">Entradas</p>
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
                  <p className="font-bold text-lg text-white">Todo dia 27 que tem aula</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-zinc-300">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-zinc-800">
                  <Clock size={20} className="text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Horário</p>
                  <p className="font-bold text-2xl text-[#FF8C00]">às 18:30</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-zinc-300">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-zinc-800">
                  <MapPin size={20} className="text-[#FF8C00]" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Local</p>
                  <p className="font-bold text-white text-lg">Nas duas entradas da faculdade (Unisales)</p>
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

      {/* Eco-Gincana Section */}
      <section className="bg-zinc-950 p-8 md:p-12 rounded-3xl border border-zinc-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-[#FF8C00] text-xs font-bold uppercase tracking-widest">
              <Award size={16} />
              <span>Evento de Destaque</span>
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Eco-Gincana de Eletrônicos</h2>
            <p className="text-zinc-400 max-w-xl">
              Nossa competição acadêmica de reciclagem que mobilizou diferentes cursos para descarte consciente.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-center">
              <p className="text-3xl font-black text-[#FF8C00]">22</p>
              <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Alunos Participantes</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 px-6 py-4 rounded-2xl text-center">
              <p className="text-3xl font-black text-[#FF8C00]">100%</p>
              <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Doadores Ativos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Doadores Connection */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight flex items-center space-x-2 text-white">
              <Users className="text-[#FF8C00]" size={22} />
              <span>Conexão com Doadores</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Todos os <strong className="text-white">22 alunos participantes</strong> da comissão organizadora e das equipes integraram-se como <strong className="text-white">doadores ativos</strong> na plataforma ZeroVinTTech. 
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Dessa forma, cada quilo de lixo eletrônico coletado foi catalogado, validando a gincana física em conformidade digital com nossa plataforma de economia circular.
            </p>
            <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/20 p-6 rounded-2xl flex items-start space-x-3">
              <Zap className="text-[#FF8C00] flex-shrink-0 mt-1" size={20} />
              <p className="text-xs text-[#FF8C00] font-medium leading-relaxed">
                Resultado de Impacto: Essa gincana evitou a contaminação de milhares de litros de água trazendo o material direto para o descarte ecológico nas entradas!
              </p>
            </div>
          </div>

          {/* Top Courses Ranking */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight flex items-center space-x-2 text-white">
              <Award className="text-[#FF8C00]" size={22} />
              <span>Quem mais doou?</span>
            </h3>
            <div className="space-y-4">
              {rankingCursos.map((curso, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-zinc-300">
                      <span className="text-[#FF8C00] mr-1.5">{idx + 1}º</span> {curso.nome}
                    </span>
                    <span className="text-xs bg-[#FF8C00]/10 text-[#FF8C00] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {curso.doado}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="bg-gradient-to-r from-[#FF8C00] to-yellow-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${curso.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">
                {event.date === '2026-04-27' 
                  ? '27 de abril de 2026' 
                  : new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                }
              </p>
              <p className="text-3xl font-black tracking-tighter text-[#FF8C00]">{event.totalCollectedKg}kg</p>
              <p className="text-xs text-zinc-400 mt-1">
                {event.id === 'event-27-04' ? 'Coletas Eco-Gincana nas Entradas' : 'Coletados na Unisales'}
              </p>
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
