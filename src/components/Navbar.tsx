import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { UserProfile, Donation } from '../types';
import { LogOut, User as UserIcon, PlusCircle, Calendar, MessageSquare, Home } from 'lucide-react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';

interface NavbarProps {
  user: User | null;
  profile: UserProfile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const handleLogout = async () => {
    localStorage.removeItem('mockUser');
    localStorage.removeItem('originalMockUser');
    await auth.signOut();
    window.location.href = '/'; // Force reload to clear state
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let unsubscribeMessages = () => {};
    let unsubscribeRequests = () => {};
    let unsubscribeDonations = () => {};

    const calculateUnread = async () => {
      try {
        const allMockDonations: Donation[] = JSON.parse(localStorage.getItem('mockDonations') || '[]');
        const allMockMessages = JSON.parse(localStorage.getItem('mockMessages') || '[]');
        const allMockRequests = JSON.parse(localStorage.getItem('mockRequests') || '[]');

        let realDonations: Donation[] = [];
        let realMessages: any[] = [];
        let realRequests: any[] = [];

        try {
          const dSnap = await getDocs(collection(db, 'donations'));
          realDonations = dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));

          const mSnap = await getDocs(collection(db, 'messages'));
          realMessages = mSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          const rSnap = await getDocs(collection(db, 'requests'));
          realRequests = rSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
          console.warn('Navbar Firestore fetch error:', err);
        }

        const dMap = new Map<string, Donation>();
        realDonations.forEach(d => {
          if (d.id) dMap.set(d.id, d);
        });
        allMockDonations.forEach(d => {
          if (d.id && !dMap.has(d.id)) {
            dMap.set(d.id, d);
          }
        });
        const mergedDonations = Array.from(dMap.values());

        const msgMap = new Map<string, any>();
        realMessages.forEach(m => {
          if (m.id) msgMap.set(m.id, m);
        });
        allMockMessages.forEach((m: any) => {
          if (m.id && !msgMap.has(m.id)) {
            msgMap.set(m.id, m);
          }
        });
        const mergedMessages = Array.from(msgMap.values());

        const reqMap = new Map<string, any>();
        realRequests.forEach(r => {
          if (r.id) reqMap.set(r.id, r);
        });
        allMockRequests.forEach((r: any) => {
          if (r.id && !reqMap.has(r.id)) {
            reqMap.set(r.id, r);
          }
        });
        const mergedRequests = Array.from(reqMap.values());

        const uniqueDonationIds: string[] = Array.from(new Set(mergedMessages.map((m: any) => m.donationId)));

        let count = 0;
        uniqueDonationIds.forEach(dId => {
          const donationObj = mergedDonations.find(d => d.id === dId);
          if (!donationObj) return;

          const roomMessages = mergedMessages.filter((m: any) => m.donationId === dId);
          if (roomMessages.length === 0) return;

          const isDonor = donationObj.donorId === user.uid;
          const isRequester = mergedRequests.some(r => r.donationId === dId && r.requesterId === user.uid);
          const hasSentMessage = roomMessages.some(m => m.senderId === user.uid);

          const isParticipant = isDonor || isRequester || hasSentMessage;
          if (!isParticipant) return;

          const lastMsg = roomMessages[roomMessages.length - 1];
          if (lastMsg && lastMsg.senderId !== user.uid) {
            const lastRead = localStorage.getItem(`lastRead_${dId}`);
            if (!lastRead || new Date(lastMsg.createdAt).getTime() > new Date(lastRead).getTime()) {
              count++;
            }
          }
        });

        // Compute pending requests received as donor
        const pendingCount = mergedRequests.filter((r: any) => r.donorId === user.uid && r.status === 'pending').length;
        setPendingRequestsCount(pendingCount);
        setUnreadCount(count);
      } catch (err) {
        console.error('Error calculating unread custom:', err);
      }
    };

    calculateUnread();

    try {
      unsubscribeMessages = onSnapshot(collection(db, 'messages'), () => {
        calculateUnread();
      });
      unsubscribeRequests = onSnapshot(collection(db, 'requests'), () => {
        calculateUnread();
      });
      unsubscribeDonations = onSnapshot(collection(db, 'donations'), () => {
        calculateUnread();
      });
    } catch (err) {
      console.warn('Navbar listeners failed:', err);
    }

    const handleFocus = () => {
      calculateUnread();
    };

    window.addEventListener('focus', handleFocus);
    const interval = setInterval(calculateUnread, 3000);

    return () => {
      unsubscribeMessages();
      unsubscribeRequests();
      unsubscribeDonations();
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user]);

  return (
    <nav className="bg-black border-b border-[#FF8C00]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="relative w-11 h-11 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Orange segment: Top horizontal bar and diagonal left side */}
              <path
                d="M 31.5 35 C 31.5 30.5 35 28 41 28 L 72.5 28 L 31.5 69 L 31.5 59 L 51 39.5 L 31.5 35 Z"
                fill="#FF8C00"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-translate-x-0.5"
              />
              {/* White segment: Parallel diagonal line on the right and bottom wing */}
              <path
                d="M 65.5 42 L 42 65.5 L 71 65.5 C 71 65.5 65.5 59 65.5 53.5 L 65.5 42 Z"
                fill="#FFFFFF"
                className="transition-transform duration-300 group-hover:translate-y-0.5 group-hover:translate-x-0.5"
              />
            </svg>
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
          <Link to="/chats" className="hover:text-[#FF8C00] transition-colors flex items-center space-x-2 relative pr-1">
            <div className="relative">
              <MessageSquare size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#FF8C00] text-black text-[9px] font-black h-4.5 w-4.5 rounded-full flex items-center justify-center border border-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline">Chats</span>
          </Link>

          {user ? (
            <>
              <Link to="/create-donation" className="bg-[#FF8C00] text-black px-4 py-1.5 rounded-full font-semibold hover:bg-[#FF8C00]/80 transition-colors flex items-center space-x-1">
                <PlusCircle size={18} />
                <span>Doar</span>
              </Link>
              
              {/* Profile Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="hover:text-[#FF8C00] transition-colors flex items-center space-x-2 focus:outline-none cursor-pointer relative"
                >
                  <div className="relative">
                    {profile?.photoURL ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[#FF8C00]/30 hover:border-[#FF8C00]/80 transition-colors">
                        <img src={profile.photoURL} alt={profile?.name || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <UserIcon size={18} />
                    )}
                    {pendingRequestsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF8C00] h-2.5 w-2.5 rounded-full border border-black animate-pulse" />
                    )}
                  </div>
                  <span className="hidden md:inline font-semibold">{profile?.name ? profile.name.split(' ')[0] : 'Perfil'}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-zinc-950 border border-zinc-800 rounded-2xl py-2 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <Link 
                      to="/profile" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center justify-between px-4 py-3 text-sm text-zinc-300 hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <UserIcon size={16} className="text-[#FF8C00]" />
                        <span>Meu Perfil</span>
                      </div>
                      {pendingRequestsCount > 0 && (
                        <span className="bg-[#FF8C00] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </Link>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <LogOut size={16} />
                      <span>Sair do Perfil</span>
                    </button>
                  </div>
                )}
              </div>
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
