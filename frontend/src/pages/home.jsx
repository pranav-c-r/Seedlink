import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase.js';
import Lottie from 'lottie-react';
import moneyAnimation from '../../utils/money.json';

const Home = () => {
  const navigate = useNavigate();
  const [allShops, setAllShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isNearMe, setIsNearMe] = useState(false);
  const [userPincode, setUserPincode] = useState('');

  const categories = ['All', 'Local Retail Store', 'Online E-commerce Store', 'Service Business', 'Artisan/Craftsman', 'Restaurant/Food Business', 'Other'];

  useEffect(() => {
    const fetchShopsAndUser = async () => {
      setLoading(true);
      try {
        if (auth.currentUser) {
          const userDocRef = doc(database, 'Users', auth.currentUser.uid, 'businessInfo', 'data');
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserPincode(userDocSnap.data().pincode || '');
          }
        }

        const usersRef = collection(database, 'Users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);

        const fetchedShops = [];
        for (const userDoc of querySnapshot.docs) {
          const businessInfoRef = doc(database, 'Users', userDoc.id, 'businessInfo', 'data');
          const businessInfoSnap = await getDoc(businessInfoRef);
          if (businessInfoSnap.exists() && businessInfoSnap.data().isBusiness === true) {
            fetchedShops.push({ id: userDoc.id, ...businessInfoSnap.data() });
          }
        }
        setAllShops(fetchedShops);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShopsAndUser();
  }, []);

  useEffect(() => {
    let tempShops = allShops;

    if (searchTerm) {
      tempShops = tempShops.filter(shop =>
        shop.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (shop.BusinessInfo && shop.BusinessInfo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      tempShops = tempShops.filter(shop => shop.BusinessInfo === selectedCategory);
    }

    if (isNearMe && userPincode) {
      tempShops = tempShops.filter(shop => shop.pincode === userPincode);
    }

    setFilteredShops(tempShops);
  }, [allShops, searchTerm, selectedCategory, isNearMe, userPincode]);

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading businesses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl border border-gold-primary/20 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Discover Local <span className="text-gold-primary">Businesses</span>
            </h1>
            <p className="text-sm sm:text-base opacity-80">
              Explore shops, find updates, and support your local community.
            </p>
          </div>
          <div className="flex justify-center md:justify-end w-full">
            <div className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
              <Lottie animationData={moneyAnimation} loop={true} />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-gray-800/50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <input
                  type="text"
                  placeholder="Search shops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-gold-primary placeholder-gray-400"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-gold-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="near-me"
                  checked={isNearMe}
                  onChange={(e) => setIsNearMe(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-gold-primary bg-gray-700 border-gray-600 rounded"
                />
                <label htmlFor="near-me" className="text-gray-300">Show nearest to me</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.length > 0 ? (
                filteredShops.map(shop => (
                  <div 
                    key={shop.id}
                    className="bg-gray-800/30 rounded-xl border border-gray-700 hover:border-gold-primary/30 transition-all p-4 cursor-pointer"
                    onClick={() => handleShopClick(shop.id)}
                  >
                    <div className="h-40 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-400">Shop Image</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{shop.businessName}</h3>
                    <p className="text-gold-primary mb-2">{shop.BusinessInfo}</p>
                    {shop.city && shop.state && (
                      <p className="text-gray-400 text-sm mb-3">📍 {shop.city}, {shop.state}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-400">No shops found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
