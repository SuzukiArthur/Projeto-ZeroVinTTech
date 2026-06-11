import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
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
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por e-mail/senha está desativado no Firebase. Ative-o no console Firebase ou utilize o botão "Entrar com Google" abaixo.');
      } else {
        setError('E-mail ou senha incorretos, ou usuário não cadastrado. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(`Erro ao entrar com Google: ${err.message || err.code}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto flex items-center justify-center mb-4 transition-transform hover:scale-105">
            <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Orange segment: Top horizontal bar and diagonal left side */}
              <path
                d="M 31.5 35 C 31.5 30.5 35 28 41 28 L 72.5 28 L 31.5 69 L 31.5 59 L 51 39.5 L 31.5 35 Z"
                fill="#FF8C00"
              />
              {/* White segment: Parallel diagonal line on the right and bottom wing */}
              <path
                d="M 65.5 42 L 42 65.5 L 71 65.5 C 71 65.5 65.5 59 65.5 53.5 L 65.5 42 Z"
                fill="#FFFFFF"
              />
            </svg>
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

        <div className="relative my-6 flex items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="mx-4 text-xs font-bold uppercase tracking-wider text-zinc-600">OU</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-zinc-800 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 border border-zinc-700 hover:bg-zinc-700 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? 'CARREGANDO...' : 'ENTRAR COM GOOGLE'}
        </button>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            Não tem uma conta? <Link to="/register" className="text-[#FF8C00] font-bold hover:underline">Cadastre-se agora</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
