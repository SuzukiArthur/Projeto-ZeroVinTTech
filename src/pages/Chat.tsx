import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Message, Donation } from '../types';
import { handleFirestoreError, OperationType } from '../utils/error-handler';
import { Send, ArrowLeft, User, Package, Zap } from 'lucide-react';

export default function Chat() {
  const { id: donationId } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!donationId) return;

    const fetchDonation = async () => {
      try {
        // Check mock donations first
        const mockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
        const mockItem = mockDonations.find((d: any) => d.id === donationId);
        if (mockItem) {
          setDonation(mockItem);
          return;
        }

        const dSnap = await getDoc(doc(db, 'donations', donationId));
        if (dSnap.exists()) {
          setDonation({ id: dSnap.id, ...dSnap.data() } as Donation);
        }
      } catch (err) {
        console.error('Error fetching donation:', err);
      }
    };
    fetchDonation();

    // Mock Messages
    const fetchMockMessages = () => {
      const allMockMessages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
      const filtered = allMockMessages.filter((m: any) => m.donationId === donationId);
      setMessages(filtered);
      setLoading(false);
    };

    fetchMockMessages();

    // Optional: Real Firestore listener
    const q = query(
      collection(db, 'messages'),
      where('donationId', '==', donationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      if (msgs.length > 0) {
        setMessages(prev => {
          // Merge real messages with mock ones, avoiding duplicates by ID
          const combined = [...prev, ...msgs];
          const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
          return unique.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        });
      }
    }, (error) => {
      console.log('Firestore messages listener error (expected in mock mode)');
    });

    return () => unsubscribe();
  }, [donationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const mockUserStr = localStorage.getItem('mockUser');
    if (!text.trim() || !mockUserStr || !donationId) return;
    const mockUser = JSON.parse(mockUserStr);

    try {
      const newMessageObj = {
        id: 'msg-' + Date.now(),
        donationId,
        senderId: mockUser.uid,
        senderPhotoURL: mockUser.photoURL,
        text,
        createdAt: new Date().toISOString()
      };

      // Save to mock storage
      const existingMessages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
      localStorage.setItem('mockMessages', JSON.stringify([...existingMessages, newMessageObj]));
      
      // Update local state immediately
      setMessages(prev => [...prev, newMessageObj]);
      setNewMessage('');

      // Optional: Try real Firestore
      try {
        await addDoc(collection(db, 'messages'), {
          donationId,
          senderId: mockUser.uid,
          text,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        // Ignore firestore errors in mock mode
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const clearChat = () => {
    const allMockMessages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
    const filtered = allMockMessages.filter((m: any) => m.donationId !== donationId);
    localStorage.setItem('mockMessages', JSON.stringify(filtered));
    setMessages([]);
  };

  const mockUserStr = localStorage.getItem('mockUser');
  const mockUser = mockUserStr ? JSON.parse(mockUserStr) : null;
  const currentUserName = mockUser?.displayName || 'Você';

  if (loading) return <div className="text-center py-20">Carregando chat...</div>;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-black/50">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
              <Package size={24} className="text-[#FF8C00]" />
            </div>
            <div>
              <h4 className="font-bold text-lg line-clamp-1">{donation?.title}</h4>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Chat de Doação</p>
                <span className="text-[10px] bg-[#FF8C00]/10 text-[#FF8C00] px-2 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                  Logado como: {currentUserName}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          Limpar Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide bg-black/20">
        {messages.map((msg) => {
          const mockUserStr = localStorage.getItem('mockUser');
          const mockUser = mockUserStr ? JSON.parse(mockUserStr) : null;
          const isMe = msg.senderId === (mockUser?.uid || auth.currentUser?.uid);
          return (
            <div key={msg.id} className={`flex items-end space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden border border-zinc-700">
                {msg.senderPhotoURL ? (
                  <img src={msg.senderPhotoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    {isMe ? currentUserName.charAt(0) : '?'}
                  </div>
                )}
              </div>
              <div className={`max-w-[75%] p-5 rounded-3xl text-base leading-relaxed shadow-lg ${
                isMe ? 'bg-[#FF8C00] text-black font-medium rounded-br-none' : 'bg-zinc-800 text-white rounded-bl-none border border-zinc-700'
              }`}>
                {msg.text}
                <p className={`text-[10px] mt-2 font-bold opacity-70 ${isMe ? 'text-black' : 'text-zinc-500'}`}>
                  {msg.createdAt?.toDate ? 
                    msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                    new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="p-4 border-t border-zinc-800 bg-black/50">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(newMessage); }}
          className="flex items-center space-x-3"
        >
          <input 
            type="text" 
            placeholder="Escreva sua mensagem..." 
            className="flex-grow bg-black border border-zinc-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-[#FF8C00] transition-all text-sm"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-[#FF8C00] text-black p-4 rounded-2xl hover:bg-[#FF8C00]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,140,0,0.2)]"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
