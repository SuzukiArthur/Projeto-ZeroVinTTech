import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Donation, DonationRequest, UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../utils/error-handler';
import DonationCard from '../components/DonationCard';
import { User, Package, Clock, Check, X, MessageSquare, Tag, Trash2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfileProps {
  profile: UserProfile | null;
}

export default function Profile({ profile }: ProfileProps) {
  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'donations' | 'requests' | 'incoming'>('donations');
  const [photoUrl, setPhotoUrl] = useState(profile?.photoURL || '');
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPhotoUrl(base64String);
        
        // Auto-save when file is selected
        const mockUserStr = localStorage.getItem('mockUser');
        if (!mockUserStr) return;
        const mockUser = JSON.parse(mockUserStr);
        const updatedUser = { ...mockUser, photoURL: base64String };
        localStorage.setItem('mockUser', JSON.stringify(updatedUser));
        window.location.reload();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePhoto = () => {
    const mockUserStr = localStorage.getItem('mockUser');
    if (!mockUserStr) return;
    const mockUser = JSON.parse(mockUserStr);
    const updatedUser = { ...mockUser, photoURL: photoUrl };
    localStorage.setItem('mockUser', JSON.stringify(updatedUser));
    setIsEditingPhoto(false);
    window.location.reload(); // Refresh to update profile across app
  };

  const handleDeleteAccount = () => {
    // In a real app, we would call a backend API
    // In this mock app, we just clear the session and redirect
    localStorage.removeItem('mockUser');
    localStorage.removeItem('originalMockUser');
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchData = async () => {
      const mockUserStr = localStorage.getItem('mockUser');
      if (!mockUserStr) return;
      const mockUser = JSON.parse(mockUserStr);
      
      try {
        // Fetch mock donations
        const allMockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
        const myMockDonations = allMockDonations.filter((d: any) => d.donorId === mockUser.uid);
        
        // Fetch mock requests
        const allMockRequests = JSON.parse(localStorage.getItem('mockRequests') || '[]');
        const myMockRequests = allMockRequests.filter((r: any) => r.requesterId === mockUser.uid);
        
        // Fetch incoming requests
        const myDonationIds = myMockDonations.map((d: any) => d.id);
        const incomingMockRequests = allMockRequests.filter((r: any) => myDonationIds.includes(r.donationId));

        setMyDonations(myMockDonations);
        setMyRequests(myMockRequests);
        setIncomingRequests(incomingMockRequests);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRequestStatus = async (requestId: string, donationId: string, status: 'accepted' | 'rejected') => {
    try {
      // Update mock requests
      const allMockRequests = JSON.parse(localStorage.getItem('mockRequests') || '[]');
      const updatedRequests = allMockRequests.map((r: any) => 
        r.id === requestId ? { ...r, status } : r
      );
      localStorage.setItem('mockRequests', JSON.stringify(updatedRequests));

      // Update mock donations
      const allMockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
      const updatedDonations = allMockDonations.map((d: any) => 
        d.id === donationId ? { ...d, status: status === 'accepted' ? 'donated' : 'available' } : d
      );
      localStorage.setItem('mockDonations', JSON.stringify(updatedDonations));

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Error updating request status:', err);
    }
  };

  if (loading) return <div className="text-center py-20">Carregando...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Profile Header */}
      <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-12">
        <div className="relative group">
          <div className="w-24 h-24 bg-[#FF8C00] rounded-3xl flex items-center justify-center text-black font-black text-4xl shadow-[0_0_30px_rgba(255,140,0,0.2)] overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              profile?.name.charAt(0)
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 bg-zinc-800 p-2 rounded-full border border-zinc-700 hover:bg-zinc-700 transition-colors shadow-lg cursor-pointer">
            <User size={16} className="text-[#FF8C00]" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </label>
        </div>

        <div className="flex-grow text-center md:text-left">
          {isEditingPhoto ? (
            <div className="space-y-3 max-w-md mx-auto md:mx-0">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">URL da Foto de Perfil</label>
              <div className="flex space-x-2">
                <input 
                  type="url" 
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://exemplo.com/foto.jpg"
                  className="flex-grow bg-black border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#FF8C00]"
                />
                <button 
                  onClick={handleUpdatePhoto}
                  className="bg-[#FF8C00] text-black px-4 py-2 rounded-xl font-bold text-sm"
                >
                  Salvar
                </button>
              </div>
              <p className="text-[9px] text-zinc-600">Use uma URL de imagem pública (ex: do Google Imagens ou Unsplash)</p>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{profile?.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-zinc-400 text-sm">
                <div className="flex items-center space-x-1">
                  <Tag size={16} className="text-[#FF8C00]" />
                  <span>RA: {profile?.ra}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User size={16} className="text-[#FF8C00]" />
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Package size={16} className="text-[#FF8C00]" />
                  <span>{myDonations.length} Doações</span>
                </div>
              </div>
            </>
          )}
        </div>
        <Link to="/create-donation" className="bg-[#FF8C00] text-black px-8 py-3 rounded-full font-bold hover:bg-[#FF8C00]/90 transition-all">
          Nova Doação
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('donations')}
          className={`px-6 py-4 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${activeTab === 'donations' ? 'border-[#FF8C00] text-[#FF8C00]' : 'border-transparent text-zinc-500 hover:text-white'}`}
        >
          Meus Anúncios ({myDonations.length})
        </button>
        <button 
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-4 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${activeTab === 'requests' ? 'border-[#FF8C00] text-[#FF8C00]' : 'border-transparent text-zinc-500 hover:text-white'}`}
        >
          Minhas Solicitações ({myRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('incoming')}
          className={`px-6 py-4 font-bold uppercase tracking-widest text-xs transition-colors border-b-2 ${activeTab === 'incoming' ? 'border-[#FF8C00] text-[#FF8C00]' : 'border-transparent text-zinc-500 hover:text-white'}`}
        >
          Pedidos Recebidos ({incomingRequests.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'donations' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myDonations.map(donation => (
              <DonationCard key={donation.id} donation={donation} />
            ))}
            {myDonations.length === 0 && <p className="col-span-full text-center py-12 text-zinc-500">Você ainda não anunciou nenhum produto.</p>}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {myRequests.map(request => (
              <div key={request.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Package size={24} className="text-[#FF8C00]" />
                  </div>
                  <div>
                    <h4 className="font-bold">Solicitação para Doação #{request.donationId.slice(0, 5)}</h4>
                    <p className="text-sm text-zinc-500">Enviado em {
                      request.createdAt?.toDate ? 
                      new Date(request.createdAt.toDate()).toLocaleDateString() : 
                      new Date(request.createdAt).toLocaleDateString()
                    }</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    request.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {request.status === 'pending' ? 'Pendente' : request.status === 'accepted' ? 'Aceito' : 'Recusado'}
                  </span>
                  {request.status === 'accepted' && (
                    <Link to={`/chat/${request.donationId}`} className="text-[#FF8C00] hover:underline flex items-center space-x-1 text-sm">
                      <MessageSquare size={16} />
                      <span>Abrir Chat</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {myRequests.length === 0 && <p className="text-center py-12 text-zinc-500">Você ainda não solicitou nenhuma doação.</p>}
          </div>
        )}

        {activeTab === 'incoming' && (
          <div className="space-y-4">
            {incomingRequests.map(request => (
              <div key={request.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                      <User size={24} className="text-[#FF8C00]" />
                    </div>
                    <div>
                      <h4 className="font-bold">{request.requesterName} quer seu produto</h4>
                      <p className="text-sm text-zinc-500">Solicitação #{request.id.slice(0, 5)}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                    request.status === 'accepted' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {request.status === 'pending' ? 'Pendente' : request.status === 'accepted' ? 'Aceito' : 'Recusado'}
                  </span>
                </div>
                
                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Motivo da Solicitação:</p>
                  <p className="text-zinc-300 italic">"{request.explanation}"</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex space-x-4 pt-2">
                    <button 
                      onClick={() => handleRequestStatus(request.id, request.donationId, 'accepted')}
                      className="flex-grow bg-green-500 text-black font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
                    >
                      <Check size={18} />
                      <span>Aceitar</span>
                    </button>
                    <button 
                      onClick={() => handleRequestStatus(request.id, request.donationId, 'rejected')}
                      className="flex-grow bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors"
                    >
                      <X size={18} />
                      <span>Recusar</span>
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <Link to={`/chat/${request.donationId}`} className="w-full bg-[#FF8C00] text-black font-bold py-3 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#FF8C00]/90 transition-colors">
                    <MessageSquare size={18} />
                    <span>Combinar Entrega</span>
                  </Link>
                )}
              </div>
            ))}
            {incomingRequests.length === 0 && <p className="text-center py-12 text-zinc-500">Nenhuma solicitação recebida ainda.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
