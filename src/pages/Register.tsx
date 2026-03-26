import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, Mail, Lock, Hash, ArrowRight, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Mock Register for visual navigation
    setTimeout(() => {
      const mockUser = {
        uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: name,
        ra: ra,
        photoURL: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        role: 'student'
      };
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('originalMockUser', JSON.stringify(mockUser));
      window.location.href = '/'; // Force reload to update App state
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tighter">CRIAR CONTA</h1>
          <p className="text-zinc-500 mt-2">Junte-se à comunidade ZeroVinTTech</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 flex items-center space-x-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Registro do Aluno (RA)</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
                placeholder="Ex: 12345678"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Foto de Perfil (Opcional)</label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl border border-zinc-700 flex items-center justify-center overflow-hidden">
                {photoURL ? (
                  <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={24} className="text-zinc-600" />
                )}
              </div>
              <label className="flex-grow bg-zinc-800 text-white px-4 py-3 rounded-xl font-bold text-xs text-center cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-700">
                ESCOLHER FOTO
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">Ou cole uma URL abaixo:</p>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="url" 
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
                placeholder="https://exemplo.com/foto.jpg"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#FF8C00] text-black font-black py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-[#FF8C00]/90 transition-all disabled:opacity-50"
          >
            <span>{loading ? 'CRIANDO...' : 'CRIAR CONTA'}</span>
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            Já tem uma conta? <Link to="/login" className="text-[#FF8C00] font-bold hover:underline">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
