import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DonationCondition, DonationCategory } from '../types';
import { handleFirestoreError, OperationType } from '../utils/error-handler';
import { Plus, Image as ImageIcon, X, AlertCircle, ArrowRight, Tag } from 'lucide-react';

export default function CreateDonation() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<DonationCategory>('outros');
  const [condition, setCondition] = useState<DonationCondition>('Usado - Bom');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories: { id: DonationCategory, label: string }[] = [
    { id: 'periferico', label: 'Periférico' },
    { id: 'componente eletronico', label: 'Componente Eletrônico' },
    { id: 'notebook', label: 'Notebook' },
    { id: 'celular', label: 'Celular' },
    { id: 'videogame', label: 'Videogame' },
    { id: 'pc', label: 'PC Desktop' },
    { id: 'rede', label: 'Rede' },
    { id: 'outros', label: 'Outros' },
  ];

  const handleAddPhoto = () => {
    if (photoUrl && photos.length < 5) {
      setPhotos([...photos, photoUrl]);
      setPhotoUrl('');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const mockUserStr = localStorage.getItem('mockUser');
    if (!mockUserStr) {
      setError('Você precisa estar logado para publicar.');
      return;
    }
    
    const mockUser = JSON.parse(mockUserStr);
    setLoading(true);
    setError('');
    
    try {
      const newDonation = {
        id: 'mock-' + Date.now(),
        title,
        description,
        category,
        condition,
        photos: photos.length > 0 ? photos : [`https://picsum.photos/seed/${Date.now()}/800/600`],
        donorId: mockUser.uid,
        donorName: mockUser.displayName || 'Usuário Teste',
        status: 'available',
        createdAt: new Date().toISOString()
      };

      // Save to mock storage
      const existingDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
      localStorage.setItem('mockDonations', JSON.stringify([newDonation, ...existingDonations]));
      
      // Try to save to real Firestore (optional)
      try {
        await addDoc(collection(db, 'donations'), {
          ...newDonation,
          createdAt: serverTimestamp()
        });
      } catch (e) {
        console.log('Firestore not configured, using mock data only');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/');
    } catch (err) {
      setError('Erro ao criar anúncio. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
            ANUNCIE SUA <span className="text-[#FF8C00]">DOAÇÃO</span>
          </h1>
          <p className="text-zinc-500 mt-4 text-lg">Preencha os detalhes abaixo para que outros alunos possam encontrar seu item.</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center">
          <p className="text-[#FF8C00] font-black text-3xl">#01</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Passo Único</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Photos Section */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <ImageIcon size={20} className="text-[#FF8C00]" />
            <span>Fotos do Produto</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {photos.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800">
                <img src={url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/50 p-1 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {photos.length < 5 && (
              <div className="aspect-square rounded-xl border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-600">
                <ImageIcon size={24} />
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <input 
              type="url" 
              placeholder="Cole a URL de uma foto..." 
              className="flex-grow bg-black border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
            <button 
              type="button"
              onClick={handleAddPhoto}
              className="bg-zinc-800 text-white px-6 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Máximo 5 fotos. Use URLs de imagens públicas.</p>
        </div>

        {/* Details Section */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6">
          <h3 className="text-xl font-bold flex items-center space-x-2">
            <Tag size={20} className="text-[#FF8C00]" />
            <span>Detalhes do Item</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título do Anúncio</label>
            <input 
              type="text" 
              required
              className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
              placeholder="Ex: Mouse Gamer Logitech G203"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Categoria</label>
              <select 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FF8C00] transition-colors appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value as DonationCategory)}
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Estado de Conservação</label>
              <select 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FF8C00] transition-colors appearance-none"
                value={condition}
                onChange={(e) => setCondition(e.target.value as DonationCondition)}
              >
                <option value="Novo">Novo</option>
                <option value="Usado - Bom">Usado - Bom</option>
                <option value="Para Conserto">Para Conserto</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descrição e Observações</label>
            <textarea 
              required
              rows={5}
              className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:border-[#FF8C00] transition-colors resize-none"
              placeholder="Descreva o produto, tempo de uso, se acompanha carregador, etc..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center space-x-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#FF8C00] text-black font-black py-5 rounded-3xl flex items-center justify-center space-x-2 hover:bg-[#FF8C00]/90 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(255,140,0,0.2)]"
        >
          <span>{loading ? 'PUBLICANDO...' : 'PUBLICAR ANÚNCIO'}</span>
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>
    </div>
  );
}
