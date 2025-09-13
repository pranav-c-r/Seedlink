import { auth, database, googleprovider } from '../config/firebase';
import { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import googlepic from '../assets/googlepic.png';
import { collection } from 'firebase/firestore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
const Signin = ({ isSignUp = false }) => {
    const navigate = useNavigate();
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(database, "Users", auth.currentUser?.uid, "businessInfo", "data");
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                navigate('/home')
            }else{
                navigate("/welcome");
            }
            }
        });

        return () => unsubscribe();
    }, [navigate]);


    const signInWithGoogle = async () => {
        if (!username) {
            alert("Please enter username");
            return;
        }
        try {
            await signInWithPopup(auth, googleprovider);
            addUser();
            const userDocRef = doc(database, "Users", auth.currentUser?.uid, "businessInfo", "data");
            const docSnap = await getDoc(userDocRef);
            
            if (docSnap.exists()) {
                navigate('/home')
            }else{
                navigate("/welcome");
            }
        } catch (error) {
            console.error("Error signing in with Google:", error.message);
            alert("Error signing in with Google. Please try again.");
        }
    };
    const [username, setusername] = useState("");
    const addUser = async () => {
        const userRef = collection(database, "Users");
        const userDocRef = doc(userRef, auth.currentUser.uid);

        try {
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    username: username,
                    email: auth.currentUser.email,
                });
            }
        } catch (err) {
            console.error("Error adding user:", err);
        }
    };
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-black/30 p-8 rounded-xl shadow-lg border border-gold-primary/30">
                    <div className="mb-6">
                        <label className="block text-white text-sm font-medium mb-2">Username</label>
                        <input 
                            type="text" 
                            placeholder="Enter your username" 
                            className="w-full p-3 bg-bg-primary border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-primary text-white" 
                            onChange={(e) => setusername(e.target.value)} 
                        />
                    </div>
                    
                    <div className="mt-8">
                        <button 
                            onClick={signInWithGoogle}
                            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 px-4 rounded-lg hover:bg-gray-100 transition-all font-medium"
                        >
                            <img className="w-6 h-6" src={googlepic} alt="Google" />
                            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
                        </button>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <Link to="/" className="text-gray-400 hover:text-white text-sm flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signin;