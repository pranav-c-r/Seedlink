import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { database } from '../config/firebase.js';
import Lottie from 'lottie-react';
import profileAnimation from '../../utils/profile.json';

const ShopDetails = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const [shop, setShop] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!shopId) {
            navigate('/home');
            return;
        }
        const fetchShopDetails = async () => {
            setLoading(true);
            try {
                const shopDocRef = doc(database, 'Users', shopId, 'businessInfo', 'data');
                const shopDocSnap = await getDoc(shopDocRef);
                if (shopDocSnap.exists()) {
                    setShop({ id: shopDocSnap.id, ...shopDocSnap.data() });
                } else {
                    setShop(null);
                }
            } catch (error) {
                console.error('Error fetching shop details:', error);
                setShop(null);
            } finally {
                setLoading(false);
            }
        };
        const fetchShopUpdates = () => {
            const updatesCollectionRef = collection(database, 'Users', shopId, 'updates');
            const q = query(updatesCollectionRef);
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const fetchedUpdates = [];
                querySnapshot.forEach((doc) => {
                    fetchedUpdates.push({ id: doc.id, ...doc.data() });
                });
                setUpdates(fetchedUpdates.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
            }, (error) => {
                console.error('Error fetching updates:', error);
            });
            return unsubscribe;
        };
        fetchShopDetails();
        const unsubscribeUpdates = fetchShopUpdates();
        return () => unsubscribeUpdates();
    }, [shopId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex items-center justify-center">
                <div className="text-xl">Loading shop details...</div>
            </div>
        );
    }
    if (!shop) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Shop not found.</h1>
                <button
                    onClick={() => navigate('/home')}
                    className="bg-gold-primary hover:bg-gold-dark text-black font-bold py-2 px-4 rounded transition-colors"
                >
                    Go Back to Home
                </button>
            </div>
        );
    }
    const handleUpdateClick = (update) => {
      navigate(`/post/${update.uniqueId}`, { state: { post: update } });
    };
    const handleView3DClick = () => {
        navigate('/shop', { state: { arImages: shop.arImages, shopName: shop.businessName } });
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl border border-gold-primary/20 mb-8">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
                            ← Back
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gold-primary/20 rounded-full flex items-center justify-center text-gold-primary text-4xl font-bold flex-shrink-0">
                            {shop.businessName.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-extrabold text-gold-primary">{shop.businessName}</h1>
                            <p className="text-xl text-gray-300 mt-2">{shop.BusinessInfo}</p>
                            {shop.city && shop.state && (
                                <p className="text-gray-400 mt-1">📍 {shop.city}, {shop.state}</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gold-primary/20">
                        <h2 className="text-2xl font-bold mb-4">Store Details</h2>
                        <p className="text-gray-300">
                            <strong>Address:</strong> {shop.address || 'N/A'}
                        </p>
                        <p className="text-gray-300 mt-2">
                            <strong>Pincode:</strong> {shop.pincode || 'N/A'}
                        </p>
                        <button 
                            onClick={handleView3DClick}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            View Shop in 3D
                        </button>
                    </div>
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gold-primary/20 flex flex-col items-center justify-center">
                        <div className="w-32 h-32 md:w-48 md:h-48">
                            <Lottie animationData={profileAnimation} loop={true} />
                        </div>
                        <h3 className="text-xl font-bold mt-4">Connect with {shop.businessName}</h3>
                        <p className="text-gray-400 text-center">
                            Reach out for more details or visit the physical store.
                        </p>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-xl border border-gold-primary/20">
                    <h2 className="text-2xl font-bold mb-4">Updates from {shop.businessName}</h2>
                    {updates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {updates.map(update => (
                                <div
                                    key={update.id}
                                    onClick={() => handleUpdateClick(update)}
                                    className="bg-gray-900/50 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
                                >
                                    {update.images && update.images.length > 0 && (
                                        <div className="w-full h-32 overflow-hidden rounded-lg mb-3">
                                            <img src={update.images[0]} alt={update.heading} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <h3 className="text-lg font-bold text-gold-primary">{update.heading}</h3>
                                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">{update.content}</p>
                                    <div className="flex flex-wrap gap-2 text-xs mt-3">
                                        {update.hashtags?.map((tag, index) => (
                                            <span key={index} className="bg-gray-700/50 px-2 py-1 rounded-full text-gray-400">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-400">This business has no recent updates.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShopDetails;
