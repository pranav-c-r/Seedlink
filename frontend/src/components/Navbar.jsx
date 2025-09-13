import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth, database } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!auth.currentUser);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        const userDocRef = doc(database, "Users", user.uid, "businessInfo", "data");
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          if (docData && docData.isBusiness === true) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        } else {
          setIsVisible(false);
        }
      } else {
        setIsVisible(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);
  if (location.pathname === '/') {
    return null;
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-bg-primary py-4 shadow-md sticky top-0 z-50 border-b-2 border-gold-primary">
      <div className="container mx-auto px-4 flex justify-between items-center max-w-7xl">
        <Link to="/home" className="text-2xl font-bold text-white">
          <span className="tracking-wide">Seedlink<span className="text-gold-primary font-extrabold">AI</span></span>
        </Link>
        
        <div className="flex gap-6 items-center">
          {isLoggedIn ? (
            <>
              {isVisible && (
                <Link to="/dashboard" className="text-white hover:text-gold-light font-medium relative after:absolute after:w-0 after:h-0.5 after:bg-gold-primary after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all">
                  Add Updates
                </Link>
              )}
              <Link to="/explore" className="text-white hover:text-gold-light font-medium relative after:absolute after:w-0 after:h-0.5 after:bg-gold-primary after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all">
                View updates
              </Link>
              <Link to="/ar-view" className="text-white hover:text-gold-light font-medium relative after:absolute after:w-0 after:h-0.5 after:bg-gold-primary after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all">
                AR View
              </Link>
              <Link to="/profile" className="text-white hover:text-gold-light font-medium relative after:absolute after:w-0 after:h-0.5 after:bg-gold-primary after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all">
                Profile
              </Link>
              <button onClick={handleLogout} className="bg-teal text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all hover:-translate-y-0.5">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signin" className="text-white hover:text-gold-light font-medium relative after:absolute after:w-0 after:h-0.5 after:bg-gold-primary after:bottom-[-4px] after:left-0 hover:after:w-full after:transition-all">
                Sign In
              </Link>
              <Link to="/signup" className="bg-gold-primary text-black px-4 py-2 rounded-lg font-medium hover:bg-gold-light transition-all hover:-translate-y-0.5">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;