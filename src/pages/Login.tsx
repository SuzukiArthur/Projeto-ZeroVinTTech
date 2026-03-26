import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Mock Login for visual navigation
    setTimeout(() => {
      const mockUser = {
        uid: 'mock-user-123',
        email: email,
        displayName: 'Usuário Teste'
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
          <div className="w-16 h-16 bg-[#FF8C00] rounded-full mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,140,0,0.3)]">
            <span className="text-black font-black text-2xl">0</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">BEM-VINDO DE VOLTA</h1>
          <p className="text-zinc-500 mt-2">Acesse sua conta ZeroVinTTech</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 flex items-center space-x-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Senha</label>
              <Link to="/forgot-password" title="Esqueci minha senha" className="text-xs text-[#FF8C00] hover:underline">Esqueceu a senha?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                required
                className="w-full bg-black border border-zinc-800 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#FF8C00] transition-colors"
                placeholder="••••••••"
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
            <span>{loading ? 'ENTRANDO...' : 'ENTRAR'}</span>
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            Não tem uma conta? <Link to="/register" className="text-[#FF8C00] font-bold hover:underline">Cadastre-se agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
