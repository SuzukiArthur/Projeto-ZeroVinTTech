import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile } from '../types';
import { LogOut, User as UserIcon, PlusCircle, Calendar, MessageSquare, Home } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    localStorage.removeItem('mockUser');
    localStorage.removeItem('originalMockUser');
    await auth.signOut();
    window.location.href = '/login'; // Force reload to clear state
  };

  const switchUser = (type: 'original' | 'requester') => {
    const current = localStorage.getItem('mockUser') ? JSON.parse(localStorage.getItem('mockUser')!) : null;
    const isCurrentlyRequester = current?.uid === 'mock-requester-456';

    if (type === 'original') {
      const originalUser = localStorage.getItem('originalMockUser');
      if (originalUser) {
        localStorage.setItem('mockUser', originalUser);
      }
    } else {
      // If we are NOT currently the requester, save our current account as the original
      if (!isCurrentlyRequester && current) {
        localStorage.setItem('originalMockUser', JSON.stringify(current));
      }
      
      const requesterUser = { 
        uid: 'mock-requester-456', 
        displayName: 'Ana Interessada', 
        email: 'ana@unisales.edu.br' 
      };
      localStorage.setItem('mockUser', JSON.stringify(requesterUser));
    }
    window.location.reload();
  };

  const originalUser = localStorage.getItem('originalMockUser') ? JSON.parse(localStorage.getItem('originalMockUser')!) : null;
  const originalName = originalUser?.displayName?.split(' ')[0] || 'Minha Conta';
  
  const isMockRequester = user?.uid === 'mock-requester-456';

  return (
    <nav className="bg-black border-b border-[#FF8C00]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#FF8C00] rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 opacity-20"></div>
            <div className="absolute inset-0 border-2 border-[#FF8C00] rounded-xl -rotate-3 group-hover:rotate-0 transition-transform duration-300"></div>
            <span className="text-[#FF8C00] font-black text-xl z-10">0</span>
          </div>
          <span className="text-2xl font-black tracking-tighter flex items-center">
            <span className="text-white">Zero</span>
            <span className="text-[#FF8C00]">VinT</span>
            <span className="text-white">Tech</span>
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-[#FF8C00] transition-colors flex items-center space-x-1">
            <Home size={18} />
            <span className="hidden md:inline">Home</span>
          </Link>
          <Link to="/events" className="hover:text-[#FF8C00] transition-colors flex items-center space-x-1">
            <Calendar size={18} />
            <span className="hidden md:inline">Eventos</span>
          </Link>

          {user ? (
            <>
              {/* User Switcher for Testing */}
              <div className="flex items-center bg-zinc-900 rounded-full px-1 py-1 border border-zinc-800 scale-75 sm:scale-100">
                <button 
                  onClick={() => switchUser('original')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase transition-all ${!isMockRequester ? 'bg-[#FF8C00] text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  {originalName}
                </button>
                <button 
                  onClick={() => switchUser('requester')}
                  className={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-bold uppercase transition-all ${isMockRequester ? 'bg-[#FF8C00] text-black' : 'text-zinc-500 hover:text-white'}`}
                >
                  Ana (Teste)
                </button>
              </div>

              <Link to="/create-donation" className="bg-[#FF8C00] text-black px-4 py-1.5 rounded-full font-semibold hover:bg-[#FF8C00]/80 transition-colors flex items-center space-x-1">
                <PlusCircle size={18} />
                <span>Doar</span>
              </Link>
              <Link to="/profile" className="hover:text-[#FF8C00] transition-colors flex items-center space-x-2">
                {profile?.photoURL ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#FF8C00]/30">
                    <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <UserIcon size={18} />
                )}
                <span className="hidden md:inline">{profile?.name.split(' ')[0] || 'Perfil'}</span>
              </Link>
              <button onClick={handleLogout} className="hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-[#FF8C00] text-black px-6 py-1.5 rounded-full font-semibold hover:bg-[#FF8C00]/80 transition-colors">
              Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
