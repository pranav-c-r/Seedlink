import React, { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import profileAnimation from '../../utils/profile.json';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isBusiness, setIsBusiness] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tempData, setTempData] = useState({});
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const docRef = doc(database, `Users/${userId}/businessInfo/data`);
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          setTempData(data);
          if (typeof data.isBusiness === 'boolean') {
            setIsBusiness(data.isBusiness);
          } else {
            setIsBusiness(false);
          }
        } else {
          setProfileData({});
          setTempData({});
          setIsBusiness(false);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
        setIsBusiness(false);
      }
    );
    return () => unsubscribe();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (name, value) => {
    setTempData((prev) => {
      const current = prev[name] || [];
      return current.includes(value)
        ? { ...prev, [name]: current.filter((item) => item !== value) }
        : { ...prev, [name]: [...current, value] };
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((base64Images) => {
      setTempData((prev) => {
        const existing = Array.isArray(prev.arImages) ? prev.arImages : [];
        // Append new images, but keep max 4
        const combined = [...existing, ...base64Images].slice(0, 4);
        return {
          ...prev,
          arImages: combined,
        };
      });
    });
  };

  const handleUpdate = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docRef = doc(database, `Users/${userId}/businessInfo/data`);
      await updateDoc(docRef, {
        ...tempData,
        lastUpdated: new Date(),
      });
      setIsEditing(false);
    } catch {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const commonClasses =
    'min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-6';
  const cardClasses =
    'max-w-3xl mx-auto bg-gray-800/60 rounded-xl p-6 border border-gold-primary/20 shadow-lg';
  const sectionClasses = 'mb-6 bg-gray-900/50 p-4 rounded-lg';
  const inputClasses =
    'w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gold-primary';
  const buttonClasses = 'px-4 py-2 rounded-lg font-semibold transition-all';
  const labelClasses = 'block text-sm font-medium text-gray-400 mb-1';
  const valueClasses = 'mt-1 text-lg text-white';

  const renderGeneralUserProfile = () => {
    const {
      fullName,
      age,
      gender,
      postalCode,
      interests,
      exploreOptions,
      hobbies,
      preferredTimeOfDay,
      devicesUsed,
      socialPlatforms,
      preferredPaymentMethods,
      accessibilityNeeds,
      accessibilityDetails,
    } = tempData;
    const possibleInterests = [
      'Grocery', 'Electronics', 'Clothing', 'Food', 'Education', 'Health', 'Beauty',
      'Home', 'Jobs', 'Events', 'Travel', 'Services', 'Automotive', 'Other',
    ];
    const exploreOptionsList = [
      'Find deals', 'Discover businesses', 'Hire services', 'Find jobs', 'Learn courses',
      'Sell products', 'Network', 'Invest', 'Attend events', 'Other',
    ];
    const accessibilityNeedsData = accessibilityNeeds ? accessibilityDetails || 'Yes' : 'No';

    return (
      <div className={commonClasses}>
        <div className={cardClasses}>
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-40 h-40">
              <Lottie animationData={profileAnimation} loop={true} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gold-primary mt-4">My Profile</h1>
            <p className="text-center text-gray-400 mt-2">Update your personal information to get better recommendations.</p>
          </div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`${isEditing ? 'bg-red-600' : 'bg-blue-600'} text-white ${buttonClasses}`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                onClick={handleUpdate}
                disabled={loading}
                className={`ml-2 bg-green-600 hover:bg-green-700 text-white ${buttonClasses}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
          <div className="space-y-6">
            <div className={sectionClasses}>
              <h2 className="text-xl font-semibold mb-3">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Full Name</label>
                  {isEditing ? (
                    <input type="text" name="fullName" value={tempData.fullName || ''} onChange={handleInputChange} className={inputClasses} />
                  ) : (
                    <p className={valueClasses}>{fullName || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Age</label>
                  {isEditing ? (
                    <input type="number" name="age" value={tempData.age || ''} onChange={handleInputChange} className={inputClasses} />
                  ) : (
                    <p className={valueClasses}>{age || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Gender</label>
                  {isEditing ? (
                    <select name="gender" value={tempData.gender || ''} onChange={handleInputChange} className={inputClasses}>
                      <option value="">Select</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  ) : (
                    <p className={valueClasses}>{gender || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Postal Code</label>
                  {isEditing ? (
                    <input type="text" name="postalCode" value={tempData.postalCode || ''} onChange={handleInputChange} className={inputClasses} />
                  ) : (
                    <p className={valueClasses}>{postalCode || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            <div className={sectionClasses}>
              <h2 className="text-xl font-semibold mb-3">Interests & Preferences</h2>
              <div>
                <label className={labelClasses}>Primary Interests</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {possibleInterests.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleArrayChange('interests', item)}
                        className={`px-3 py-1 rounded-full text-sm ${tempData.interests?.includes(item) ? 'bg-green-600' : 'bg-gray-700'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {interests?.length > 0 ? interests.map((item, idx) => (
                      <span key={idx} className="bg-green-600 px-3 py-1 rounded-full text-sm">{item}</span>
                    )) : 'N/A'}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className={labelClasses}>What I'm Looking For</label>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exploreOptionsList.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleArrayChange('exploreOptions', item)}
                        className={`px-3 py-1 rounded-full text-sm ${tempData.exploreOptions?.includes(item) ? 'bg-blue-600' : 'bg-gray-700'}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exploreOptions?.length > 0 ? exploreOptions.map((item, idx) => (
                      <span key={idx} className="bg-blue-600 px-3 py-1 rounded-full text-sm">{item}</span>
                    )) : 'N/A'}
                  </div>
                )}
                {exploreOptions?.includes('Other') && (
                  <p className="mt-2 text-sm text-gray-400">Other: {tempData.exploreOtherText || ''}</p>
                )}
              </div>
              <div className="mt-4">
                <label className={labelClasses}>Hobbies & Interests (keywords)</label>
                {isEditing ? (
                  <input type="text" name="hobbies" value={tempData.hobbies || ''} onChange={handleInputChange} className={inputClasses} />
                ) : (
                  <p className={valueClasses}>{hobbies || 'N/A'}</p>
                )}
              </div>
            </div>

            <div className={sectionClasses}>
              <h2 className="text-xl font-semibold mb-3">Technical & Communication</h2>
              <p className="text-gray-300">
                <strong className="text-white">Devices:</strong> {devicesUsed?.length ? devicesUsed.join(', ') : 'Not provided'}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Platforms:</strong> {socialPlatforms?.length ? socialPlatforms.join(', ') : 'Not provided'}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Payment:</strong> {preferredPaymentMethods?.length ? preferredPaymentMethods.join(', ') : 'Not provided'}
              </p>
              <p className="text-gray-300">
                <strong className="text-white">Best Time:</strong> {preferredTimeOfDay?.length ? preferredTimeOfDay.join(', ') : 'Not provided'}
              </p>
            </div>
            <div className={sectionClasses}>
              <h2 className="text-xl font-semibold mb-3">Accessibility</h2>
              <p className={valueClasses}>{accessibilityNeedsData}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessProfile = () => {
    const { businessName, BusinessInfo, address, pincode, arImages } = tempData;
    return (
      <div className={commonClasses}>
        <div className={cardClasses}>
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="w-40 h-40">
              <Lottie animationData={profileAnimation} loop={true} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gold-primary mt-4">My Business Profile</h1>
            <p className="text-center text-gray-400 mt-2">Manage your business details and AR store view.</p>
          </div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`${isEditing ? 'bg-red-600' : 'bg-blue-600'} text-white ${buttonClasses}`}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                onClick={handleUpdate}
                disabled={loading}
                className={`ml-2 bg-green-600 hover:bg-green-700 text-white ${buttonClasses}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
          <div className="space-y-6">
            <div className={sectionClasses}>
              <h2 className="text-xl font-semibold mb-3">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>Business Name</label>
                  {isEditing ? (
                    <input type="text" name="businessName" value={tempData.businessName || ''} onChange={handleInputChange} className={inputClasses} />
                  ) : (
                    <p className={valueClasses}>{businessName || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Business Type</label>
                  {isEditing ? (
                    <input type="text" name="BusinessInfo" value={tempData.BusinessInfo || ''} onChange={handleInputChange} className={inputClasses} />
                  ) : (
                    <p className={valueClasses}>{BusinessInfo || 'N/A'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className={labelClasses}>Address</label>
                  {isEditing ? (
                    <textarea name="address" value={tempData.address || ''} onChange={handleInputChange} className={inputClasses} rows="3" />
                  ) : (
                    <p className={valueClasses}>{address || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>PIN Code</label>
                  {isEditing ? (
                    <input type="text" name="pincode" value={tempData.pincode || ''} onChange={handleInputChange} className={inputClasses} />
                  ) : (
                    <p className={valueClasses}>{pincode || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>
            <div className={sectionClasses}>
              <h2 className="text-xl font-semibold mb-3">AR Shop Images</h2>
              {isEditing ? (
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Upload 4 images of your shop walls
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-2">
                  These images will be used for AR shop view
                </p>
              )}
              {arImages && arImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {arImages.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Shop view ${i + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-lg mt-2">No images uploaded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return <div>{isBusiness ? renderBusinessProfile() : renderGeneralUserProfile()}</div>;
};

export default Profile;
