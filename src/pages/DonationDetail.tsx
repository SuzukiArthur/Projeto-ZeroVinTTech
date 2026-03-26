import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Donation, DonationRequest } from '../types';
import { handleFirestoreError, OperationType } from '../utils/error-handler';
import { ArrowLeft, User, Clock, Package, Send, AlertCircle, CheckCircle } from 'lucide-react';

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      if (!id) return;
      try {
        // Check mock donations first
        const mockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
        const mockItem = mockDonations.find((d: any) => d.id === id);
        
        if (mockItem) {
          setDonation(mockItem);
          setLoading(false);
          return;
        }

        // Fallback to real Firestore
        const docSnap = await getDoc(doc(db, 'donations', id));
        if (docSnap.exists()) {
          setDonation({ id: docSnap.id, ...docSnap.data() } as Donation);
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error fetching donation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id, navigate]);

  const handleRequest = async (e: any) => {
    e.preventDefault();
    const mockUserStr = localStorage.getItem('mockUser');
    if (!mockUserStr || !donation || !id) return;
    
    const mockUser = JSON.parse(mockUserStr);
    setRequesting(true);
    setError('');
    
    try {
      // Create mock request
      const newRequest = {
        id: 'req-' + Date.now(),
        donationId: id,
        requesterId: mockUser.uid,
        requesterName: mockUser.displayName || 'Usuário Teste',
        explanation,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const existingRequests = JSON.parse(localStorage.getItem('mockRequests') || '[]');
      localStorage.setItem('mockRequests', JSON.stringify([newRequest, ...existingRequests]));

      // Update mock donation status in localStorage
      const mockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
      const updatedDonations = mockDonations.map((d: any) => 
        d.id === id ? { ...d, status: 'requested' } : d
      );
      localStorage.setItem('mockDonations', JSON.stringify(updatedDonations));

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccess(true);
    } catch (err) {
      setError('Erro ao enviar solicitação. Tente novamente.');
      console.error(err);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;
  if (!donation) return null;

  const mockUserStr = localStorage.getItem('mockUser');
  const mockUser = mockUserStr ? JSON.parse(mockUserStr) : null;
  const isOwner = mockUser?.uid === donation.donorId;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-zinc-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left: Photos */}
        <div className="space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900">
            <img 
              src={donation.photos[0] || `https://picsum.photos/seed/${donation.id}/800/800`} 
              alt={donation.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {donation.photos.slice(1).map((photo, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${
                donation.condition === 'Novo' ? 'bg-green-500' : 
                donation.condition === 'Usado - Bom' ? 'bg-blue-500' : 'bg-orange-500'
              }`}>
                {donation.condition}
              </span>
              <span className="text-zinc-500 text-xs">• Postado em {
                donation.createdAt?.toDate ? 
                new Date(donation.createdAt.toDate()).toLocaleDateString() : 
                new Date(donation.createdAt).toLocaleDateString()
              }</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">{donation.title}</h1>
            <p className="text-zinc-400 mt-4 leading-relaxed text-lg">{donation.description}</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                <User size={20} className="text-[#FF8C00]" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Doador</p>
                <p className="font-bold">{donation.donorName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                <Package size={20} className="text-[#FF8C00]" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Estado</p>
                <p className="font-bold">{donation.condition}</p>
              </div>
            </div>
          </div>

          {!isOwner && donation.status === 'available' && !success && (
            <div className="bg-zinc-900 p-8 rounded-3xl border border-[#FF8C00]/30 shadow-[0_0_30px_rgba(255,140,0,0.05)]">
              <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                <Send size={20} className="text-[#FF8C00]" />
                <span>Solicitar Doação</span>
              </h3>
              <form onSubmit={handleRequest} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Por que você quer este produto?</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FF8C00] transition-colors resize-none"
                    placeholder="Explique brevemente para que fim você quer o produto..."
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-sm flex items-center space-x-1"><AlertCircle size={14}/> <span>{error}</span></p>}
                <button 
                  type="submit"
                  disabled={requesting}
                  className="w-full bg-[#FF8C00] text-black font-black py-4 rounded-xl hover:bg-[#FF8C00]/90 transition-all disabled:opacity-50"
                >
                  {requesting ? 'ENVIANDO...' : 'ENVIAR SOLICITAÇÃO'}
                </button>
              </form>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 p-8 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle size={32} className="text-black" />
              </div>
              <h3 className="text-2xl font-bold text-green-500 uppercase tracking-tighter">Solicitação Enviada!</h3>
              <p className="text-zinc-400">O doador foi notificado. Você pode acompanhar o status no seu perfil.</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-green-500 text-black px-8 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
              >
                Voltar para Home
              </button>
            </div>
          )}

          {donation.status === 'requested' && !success && (
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl text-center">
              <p className="text-zinc-500 font-bold uppercase tracking-widest">Este item já foi solicitado por outro estudante.</p>
            </div>
          )}

          {isOwner && (
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl text-center">
              <p className="text-[#FF8C00] font-bold uppercase tracking-widest">Você é o doador deste item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
