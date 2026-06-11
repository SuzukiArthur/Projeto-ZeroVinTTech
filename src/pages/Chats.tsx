import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Donation } from '../types';
import { MessageSquare, Package, ArrowRight, User } from 'lucide-react';

interface ChatRoom {
  donationId: string;
  donation: Donation;
  lastMessage: string;
  updatedAt: string;
}

export default function Chats() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Get all mock donations
        const allMockDonations: Donation[] = JSON.parse(localStorage.getItem('mockDonations') || '[]');
        
        // 2. Get all mock messages
        const allMockMessages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
        
        // Find all unique donationIds that have messages
        const uniqueDonationIds: string[] = Array.from(new Set(allMockMessages.map((m: any) => m.donationId)));
        
        const rooms: ChatRoom[] = uniqueDonationIds.map(dId => {
          const donationObj = allMockDonations.find((d: any) => d.id === dId);
          const roomMessages = allMockMessages.filter((m: any) => m.donationId === dId);
          const lastMsg = roomMessages[roomMessages.length - 1];
          
          return {
            donationId: dId,
            donation: donationObj!,
            lastMessage: lastMsg?.text || 'Sem mensagens',
            updatedAt: lastMsg?.createdAt || new Date().toISOString()
          };
        }).filter(room => room.donation !== undefined);

        // Sort by updatedAt descending
        rooms.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setChatRooms(rooms);
      } catch (err) {
        console.error('Error fetching chat rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-zinc-500">Carregando seus chats...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <MessageSquare size={36} className="text-[#FF8C00]" />
            <span>Navegação de Chats</span>
          </h1>
          <p className="text-zinc-500 mt-2">Suas negociações de doação de hardware ativas</p>
        </div>
      </div>

      <div className="space-y-4">
        {chatRooms.map((room) => (
          <div 
            key={room.donationId} 
            className="bg-zinc-900 border border-zinc-800 hover:border-[#FF8C00]/40 transition-all rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
                <Package size={28} className="text-[#FF8C00]" />
              </div>
              <div>
                <span className="text-[10px] bg-[#FF8C00]/15 text-[#FF8C00] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1.5 inline-block">
                  {room.donation.category}
                </span>
                <h3 className="text-lg font-black tracking-tight">{room.donation.title}</h3>
                <p className="text-zinc-400 text-sm italic mt-1 line-clamp-1">
                  "{room.lastMessage}"
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 font-bold">
                  <span className="flex items-center gap-1">
                    <User size={13} className="text-zinc-600" />
                    Doador: {room.donation.donorName}
                  </span>
                  <span>
                    • {new Date(room.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <Link 
              to={`/chat/${room.donationId}`}
              className="bg-[#FF8C00] text-black font-black px-6 py-3.5 rounded-2xl flex items-center space-x-2 w-full sm:w-auto justify-center hover:bg-[#FF8C00]/90 transition-all shadow-[0_0_20px_rgba(255,140,0,0.15)]"
            >
              <span>ABRIR CHAT</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ))}

        {chatRooms.length === 0 && (
          <div className="text-center py-20 bg-zinc-950/40 rounded-[32px] border border-zinc-900/60 p-8">
            <MessageSquare size={48} className="text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-400">Nenhum chat iniciado</h3>
            <p className="text-zinc-500 mt-2 max-w-sm mx-auto text-sm">
              Inicie uma conversa enviando uma solicitação justificando seu interesse por alguma peça no mural principal.
            </p>
            <div className="mt-6">
              <Link to="/" className="text-[#FF8C00] font-bold hover:underline inline-flex items-center space-x-1">
                <span>Ir para o mural</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
