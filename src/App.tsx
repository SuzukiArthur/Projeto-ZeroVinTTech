import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DonationDetail from './pages/DonationDetail';
import CreateDonation from './pages/CreateDonation';
import Events from './pages/Events';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for mock user in localStorage
    const mockUserStr = localStorage.getItem('mockUser');
    if (mockUserStr) {
      const mockUser = JSON.parse(mockUserStr);
      setUser(mockUser);
      setProfile({
        uid: mockUser.uid,
        name: mockUser.displayName || 'Usuário Teste',
        email: mockUser.email || 'teste@exemplo.com',
        ra: mockUser.ra || '12345678',
        photoURL: mockUser.photoURL,
        role: 'student'
      });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF8C00]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white flex flex-col font-sans">
        <Navbar user={user} profile={profile} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/donation/:id" element={user ? <DonationDetail /> : <Navigate to="/login" />} />
            <Route path="/create-donation" element={user ? <CreateDonation /> : <Navigate to="/login" />} />
            <Route path="/events" element={<Events />} />
            <Route path="/chat/:id" element={user ? <Chat /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile profile={profile} /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
