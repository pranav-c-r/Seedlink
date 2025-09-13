import React, { useState, useEffect } from 'react';
import { collectionGroup, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import shoppingAnimation from '../../utils/shopping.json';

const PostCard = ({ post, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 p-4 rounded-xl border border-gold-primary/20 shadow-lg hover:border-gold-primary/70 transition-all cursor-pointer"
    >
      {post.images && post.images.length > 0 && (
        <div className="w-full h-48 overflow-hidden rounded-lg mb-4 transform transition-transform duration-300 hover:scale-105">
          <img
            src={post.images[0]}
            alt={post.heading}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <h3 className="text-xl font-bold mb-2 text-gold-primary">{post.heading}</h3>
      <p className="text-sm text-gray-300 mb-4 line-clamp-3">
        {post.content}
      </p>
      <div className="flex flex-wrap gap-2 text-sm">
        {post.hashtags?.map((tag, index) => (
          <span
            key={index}
            className="bg-gray-700/50 px-2 py-1 rounded-full text-gray-400"
          >
            {tag}
          </span>
        ))}
        {post.category && (
          <span className="bg-purple-600 px-2 py-1 rounded-full text-xs text-white">
            {post.category}
          </span>
        )}
      </div>
    </div>
  );
};

const getRecommendedPosts = (allPosts, userProfile) => {
  if (!userProfile) {
    return allPosts;
  }

  const userInterests = userProfile.interests || [];
  const userPincode = userProfile.postalCode || '';
  const userAge = userProfile.age ? parseInt(userProfile.age) : null;
  const userTargetOptions = userProfile.exploreOptions || [];
  const userHobbies = userProfile.hobbies ? userProfile.hobbies.split(',').map(h => h.trim().toLowerCase()) : [];

  const getRelevanceScore = (post) => {
    let score = 0;
    const postContent = `${post.heading} ${post.content}`.toLowerCase();
    const postKeywords = [...(post.areas || []), post.aiCategory, post.category]
      .filter(Boolean)
      .map((k) => k.toLowerCase());

    const userKeywords = [
      ...userInterests.map((i) => i.toLowerCase()),
      ...userHobbies,
      ...userTargetOptions.map(o => o.toLowerCase()),
    ];

    userKeywords.forEach((userKey) => {
      if (postContent.includes(userKey) || postKeywords.includes(userKey)) {
        score += 10;
      }
    });

    post.hashtags?.forEach(tag => {
      const cleanTag = tag.replace('#', '').toLowerCase();
      if (userKeywords.some(keyword => cleanTag.includes(keyword))) {
        score += 5;
      }
    });

    if (userPincode && post.pincode && userPincode === post.pincode) {
      score += 20;
    }

    if (userAge && post.targetAudience) {
      if (
        (post.targetAudience === 'Students' && userAge < 25) ||
        (post.targetAudience === 'Seniors' && userAge >= 60) ||
        (post.targetAudience === 'Everyone')
      ) {
        score += 15;
      }
    }

    return score;
  };

  const scoredPosts = allPosts.map((post) => ({
    ...post,
    relevanceScore: getRelevanceScore(post),
  }));

  const sortedPosts = scoredPosts.sort(
    (a, b) => b.relevanceScore - a.relevanceScore
  );

  return sortedPosts;
};

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(database, 'Users', auth.currentUser.uid, 'businessInfo', 'data');
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(data);
          } else {
            console.log('User profile not found. Displaying all posts.');
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };

    const fetchAllUpdates = async () => {
      try {
        const updatesCollectionGroup = collectionGroup(database, 'updates');
        const querySnapshot = await getDocs(updatesCollectionGroup);
        const allUpdates = [];
        querySnapshot.forEach((doc) => {
          allUpdates.push({ id: doc.id, ...doc.data() });
        });
        setPosts(allUpdates);
      } catch (err) {
        console.error('Error fetching updates:', err);
        setError('Failed to fetch business updates.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchAllUpdates();
  }, []);

  useEffect(() => {
    let sortedAndFiltered = getRecommendedPosts(posts, userProfile);

    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      sortedAndFiltered = sortedAndFiltered.filter(post =>
        post.heading.toLowerCase().includes(lowerCaseSearch) ||
        post.content.toLowerCase().includes(lowerCaseSearch) ||
        post.hashtags?.some(tag => tag.toLowerCase().includes(lowerCaseSearch)) ||
        post.businessName.toLowerCase().includes(lowerCaseSearch)
      );
    }

    if (filterCategory) {
      sortedAndFiltered = sortedAndFiltered.filter(post =>
        post.category === filterCategory || post.aiCategory === filterCategory
      );
    }

    setFilteredPosts(sortedAndFiltered);
  }, [posts, userProfile, searchTerm, filterCategory]);

  const handlePostClick = (post) => {
    navigate(`/post/${post.uniqueId}`, { state: { post } });
  };

  const categories = ['Sale/Discount', 'New Product', 'Event', 'Announcement', 'Business Update', 'Job Opening', 'Partnership', 'Other', 'Grocery', 'Electronics', 'Clothing', 'Services', 'Food & Restaurants', 'Education', 'Health', 'Beauty', 'Home & Living', 'Others'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="text-xl">Loading updates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex items-center justify-center">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-12 rounded-2xl bg-gray-800/50 border border-gold-primary/20 mb-8">
            <div className="mb-6 md:mb-0">
                <h1 className="text-4xl font-extrabold text-gold-primary mb-2">
                    Explore Local Businesses
                </h1>
                <p className="text-lg text-gray-300">
                    Hey {userProfile?.fullName || 'there'}! We've sorted posts based on your interests like <span className="text-gold-primary font-medium">{userProfile?.interests?.join(', ') || 'your location and preferences'}</span>.
                </p>
            </div>
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
                <Lottie animationData={shoppingAnimation} loop={true} />
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search posts by keyword, business, or hashtag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-gold-primary"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full md:w-auto bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-primary"
          >
            <option value="">Filter by Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post.uniqueId}
                post={post}
                onClick={() => handlePostClick(post)}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400 py-12">
              No posts found. Try adjusting your search or filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
