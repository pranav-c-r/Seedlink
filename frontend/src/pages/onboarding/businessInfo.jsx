import React, { useState } from 'react';
import { auth, database } from '../../config/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { generateAIResponse } from '../../../utils/geminiAi.js';
import { useNavigate } from 'react-router-dom';

const BusinessInfo = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const [otherInfo, setOtherInfo] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [locationDetails, setLocationDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleOption = (option) => {
    setSelectedOption(option);
  };

  const getLocationFromPostal = async (postalCode) => {
    try {
      const response = await fetch(
        `http://api.geonames.org/postalCodeSearchJSON?postalcode=${postalCode}&country=IN&username=KesavanG`
      );
      const data = await response.json();
      
      if (data.postalCodes && data.postalCodes.length > 0) {
        return {
          state: data.postalCodes[0].adminName1,
          district: data.postalCodes[0].adminName2,
          city: data.postalCodes[0].placeName,
          country: data.postalCodes[0].countryCode
        };
      }
      return null;
    } catch (error) {
      console.error('GeoNames error:', error);
      return null;
    }
  };

  const handlePincodeChange = async (e) => {
    const code = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(code);
    
    if (code.length === 6) {
      setLoading(true);
      const locationInfo = await getLocationFromPostal(code);
      setLocationDetails(locationInfo);
      setLoading(false);
      
      if (locationInfo) {
        setAddress(prev => `${prev ? prev + ', ' : ''}${locationInfo.city}, ${locationInfo.district}, ${locationInfo.state}`);
      }
    } else {
      setLocationDetails(null);
    }
  };

  const getCoordinates = async (addr) => {
    if (!addr || addr.trim() === "") return null;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1&addressdetails=1`;
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });
    const data = await response.json();
    if (data.length > 0) {
      const { lat, lon, display_name } = data[0];
      return { lat, lon, display_name };
    }
    return null;
  };

  const handleBusinessTypeSelect = async () => {
    const systemPrompt = `You are a business category naming assistant. When users select "Other", you create concise, professional category names that fit alongside these existing categories: Local Retail Store, Online E-commerce Store, Service Business, Artisan/Craftsman, Restaurant/Food Business. Return ONLY the category name, nothing else. Use title case.`;
    
    try {
      const suggestion = await generateAIResponse(otherInfo, systemPrompt);
      return typeof suggestion === 'string' && suggestion.trim() !== '' ? suggestion.trim() : "Custom Business";
    } catch (error) {
      return "Custom Business";
    }
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      alert("Please enter your business name");
      return;
    }

    if (!selectedOption) {
      alert("Please select a business type");
      return;
    }

    let businessTypeToSave = selectedOption;

    if (selectedOption === "Other" && otherInfo.trim() !== '') {
      businessTypeToSave = await handleBusinessTypeSelect();
    }

    let coordsToSave = null;
    if (address.trim() !== '' && location === 'offline') {
      coordsToSave = await getCoordinates(address);
    }

    try {
      const userDocRef = doc(database, "Users", auth.currentUser?.uid, "businessInfo", "data");
      
      const businessData = {
        BusinessInfo: businessTypeToSave,
        businessName: businessName.trim(),
        location: location,
        address: address.trim(),
        timestamp: new Date(),
        pincode: pincode,
        ...(locationDetails && {
          pincode: pincode,
          city: locationDetails.city,
          district: locationDetails.district,
          state: locationDetails.state,
          country: locationDetails.country
        }),
        ...(coordsToSave && {
          latitude: coordsToSave.lat,
          longitude: coordsToSave.lon
        })
      };

      if (selectedOption === "Other" && otherInfo.trim() !== '') {
        businessData.otherInfo = otherInfo.trim();
      }

      await updateDoc(userDocRef, businessData);
      navigate('/home');
    } catch (err) {
      console.error("Error saving to Firebase:", err);
      alert("Error saving business information. Please try again.");
    }
  };

  const businessOptions = [
    { value: "Local Retail Store", label: "Local Retail Store (Kirana, Boutique, Shop)" },
    { value: "Online E-commerce Store", label: "Online E-commerce Store" },
    { value: "Service Business", label: "Service Business (Salon, Repair, Clinic)" },
    { value: "Artisan/Craftsman", label: "Artisan/Craftsman (Handmade products)" },
    { value: "Restaurant/Food Business", label: "Restaurant/Food Business" },
    { value: "Other", label: "Other (Please specify)" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Business Information</h1>
        
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gold/20 mb-6">
          <label className="block text-lg font-medium mb-2">Business Name *</label>
          <input 
            type="text" 
            placeholder="Enter your business name" 
            value={businessName} 
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
            required
          />
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gold/20 mb-6">
          <label className="block text-lg font-medium mb-4">What describes your business best? *</label>
          <div className="space-y-3">
            {businessOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="radio" 
                  checked={selectedOption === option.value}
                  onChange={() => handleOption(option.value)}
                  className="text-gold focus:ring-gold"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          
          {selectedOption === "Other" && (
            <div className="mt-4">
              <textarea 
                placeholder="Tell us about your business..." 
                value={otherInfo} 
                onChange={(e) => setOtherInfo(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
                rows="3"
              />
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gold/20 mb-6">
          <label className="block text-lg font-medium mb-4">Business Location *</label>
          <div className="space-y-3 mb-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                checked={location === 'online'}
                onChange={() => setLocation('online')}
                className="text-gold focus:ring-gold"
              />
              <span>Online Business</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="radio" 
                checked={location === 'offline'}
                onChange={() => setLocation('offline')}
                className="text-gold focus:ring-gold"
              />
              <span>Physical Store</span>
            </label>
          </div>

          {location === 'offline' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">PIN Code</label>
                <input 
                  type="text" 
                  placeholder="Enter 6-digit PIN code" 
                  value={pincode} 
                  onChange={handlePincodeChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
                  maxLength={6}
                />
                {loading && <p className="text-sm text-gray-400 mt-1">Looking up location...</p>}
                {locationDetails && (
                  <p className="text-sm text-green-400 mt-1">
                    📍 {locationDetails.city}, {locationDetails.district}, {locationDetails.state}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Full Address</label>
                <textarea 
                  placeholder="Enter your complete address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
                  rows="3"
                />
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-lg transition-colors text-lg"
        >
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
};

export default BusinessInfo;