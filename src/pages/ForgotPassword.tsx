import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      setError('Erro ao enviar e-mail. Verifique o endereço digitado.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        <Link to="/login" className="flex items-center space-x-2 text-zinc-500 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft size={16} />
          <span>Voltar para Login</span>
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tighter uppercase">RECUPERAR SENHA</h1>
          <p className="text-zinc-500 mt-2">Enviaremos um link de recuperação para seu e-mail.</p>
        </div>

        {success ? (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle size={32} className="text-black" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-green-500">E-mail Enviado!</h3>
              <p className="text-zinc-400 text-sm">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
            </div>
            <Link to="/login" className="block w-full bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-colors">
              Voltar para Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl flex items-center space-x-2 text-sm">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#FF8C00] text-black font-black py-4 rounded-xl hover:bg-[#FF8C00]/90 transition-all disabled:opacity-50"
            >
              {loading ? 'ENVIANDO...' : 'ENVIAR LINK'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
