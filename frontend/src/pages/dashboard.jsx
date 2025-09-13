import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { auth, database } from '../config/firebase';
import { generateAIResponse } from '../../utils/geminiAi';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');
  const [images, setImages] = useState([]); 
  const [category, setCategory] = useState('');
  const [aiCategory, setAiCategory] = useState(''); 
  const [areas, setAreas] = useState([]); 
  const [targetAudience, setTargetAudience] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Sale/Discount', 'New Product', 'Event', 'Announcement',
    'Business Update', 'Job Opening', 'Partnership', 'Other'
  ];
  const navigate = useNavigate()
  const targetOptions = [
    'Students', 'Families', 'Professionals', 'Seniors',
    'Women', 'Men', 'Children', 'Everyone'
  ];
  const [username, setUserName]=useState('')
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userRef = doc(database, "Users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setUserName(userData.username || 'No Username');
                } else {
                    navigate("/signin");
                }
            } else {
                navigate("/signin");
            }
        };
        fetchUserData();
    }, [navigate]);
  const handleImageSelection = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = Math.max(0, 5 - images.length);
    const toProcess = files.slice(0, remaining);

    const readers = toProcess.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result); 
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    }));

    Promise.all(readers)
      .then(base64Images => {
        setImages(prev => {
          const combined = [...prev, ...base64Images];
          return combined.slice(0, 5);
        });
      })
      .catch(err => {
        console.error("Image conversion failed:", err);
        alert("Failed to read one or more images.");
      });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateHashtags = async () => {
    setLoading(true);
    const systemPrompt = `
You generate exactly 10 relevant hashtags for marketing posts for Indian small/medium businesses.
Return ONLY the hashtags separated by commas, no extra text, each beginning with '#'.
Make them specific, short, and targeted to the heading, content and category provided.
`;
    try {
      const userPrompt = `Heading: "${heading}"\nContent: "${content}"\nCategory: "${category || aiCategory}"`;
      const suggestion = await generateAIResponse(userPrompt, systemPrompt);
      const hashtagsArray = suggestion
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .map(tag => tag.startsWith('#') ? tag : `#${tag.replace(/\s+/g, '')}`)
        .slice(0, 10);
      setHashtags(hashtagsArray);
    } catch (error) {
      console.error("Hashtag generation failed:", error);
      setHashtags([
        '#LocalBusiness', '#SmallBiz', '#SupportLocal', '#MadeInIndia',
        '#Discount', '#NewArrival', '#Sale', '#Offers', '#ShopLocal', '#Business'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestHeading = async () => {
    try {
      setLoading(true);
      const systemPrompt = `
You are an assistant that converts a short heading or content summary into a single-line catchy marketing heading.
Return ONLY the suggested heading (one line).
`;
      const userPrompt = `Heading: "${heading}"\nContent: "${content}"`;
      const suggestion = await generateAIResponse(userPrompt, systemPrompt);
      if (suggestion && typeof suggestion === 'string') setHeading(suggestion.trim());
    } catch (err) {
      console.error("Heading suggestion failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const suggestContent = async () => {
    try {
      setLoading(true);
      const systemPrompt = `
You are an assistant that rewrites marketing copy to be concise, clear and persuasive for local Indian audiences.
Return ONLY the rewritten content, no extra commentary.
`;
      const userPrompt = `Content: "${content}"\nCategory: "${category || aiCategory}"`;
      const suggestion = await generateAIResponse(userPrompt, systemPrompt);
      if (suggestion && typeof suggestion === 'string') setContent(suggestion.trim());
    } catch (err) {
      console.error("Content suggestion failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const suggestCategoryAndAreas = async () => {
    try {
      setLoading(true);
      const systemPrompt = `
You are a classification assistant. Given heading and content, output a JSON object only (no extra text) with:
{
  "category": "<single short category name - choose from Grocery, Electronics, Clothing, Services, Food & Restaurants, Education, Health, Beauty, Home & Living, Others>",
  "confidence": "<0-100>",
  "areas": ["comma separated short area/tags that this post relates to (max 6)"]
}
If unsure, pick "Others". Provide concise values and valid JSON only.
`;
      const userPrompt = `Heading: "${heading}"\nContent: "${content}"\nIf category best matches an existing one above, select it.`;
      const suggestion = await generateAIResponse(userPrompt, systemPrompt);

      let parsed = null;
      try {
        const firstBrace = suggestion.indexOf('{');
        const lastBrace = suggestion.lastIndexOf('}');
        const jsonText = (firstBrace !== -1 && lastBrace !== -1) ? suggestion.substring(firstBrace, lastBrace + 1) : suggestion;
        parsed = JSON.parse(jsonText);
      } catch (err) {
        console.warn("AI returned non-JSON classification, falling back to heuristic", err);
      }

      if (parsed) {
        setAiCategory(parsed.category || 'Others');
        if (Array.isArray(parsed.areas)) setAreas(parsed.areas.map(a => a.trim()).filter(Boolean).slice(0, 6));
      } else {
        const lc = `${heading} ${content}`.toLowerCase();
        let fallbackCat = 'Others';
        if (lc.match(/\b(grocery|vegetable|fruits|kirana|supermarket)\b/)) fallbackCat = 'Grocery';
        else if (lc.match(/\b(electronic|tv|mobile|phone|laptop|charger)\b/)) fallbackCat = 'Electronics';
        else if (lc.match(/\b(cloth|clothing|apparel|shirt|jeans|dress)\b/)) fallbackCat = 'Clothing';
        else if (lc.match(/\b(restaurant|food|meal|cafe|dine)\b/)) fallbackCat = 'Food & Restaurants';
        setAiCategory(fallbackCat);
        setAreas([]);
      }
    } catch (err) {
      console.error("Category/areas suggestion failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!heading.trim() || !content.trim()) {
      alert('Please fill in heading and content');
      return;
    }

    setLoading(true);
    try {
      if (!aiCategory) {
        await suggestCategoryAndAreas();
      }
      const random = Math.random()
      const updateDocRef = doc(database, "Users", auth.currentUser?.uid, "updates", `${random}`);

      const payload = {
        heading: heading.trim(),
        uniqueId: `${auth.currentUser.uid}-${random}`,
        content: content.trim(),
        hashtags: hashtags,
        startDate: startDate || '',
        endDate: endDate || '',
        images: images, 
        category: category || aiCategory || 'Others',
        aiCategory: aiCategory || '',
        areas: areas,
        targetAudience: targetAudience || '',
        contactInfo: contactInfo.trim() || '',
        createdAt: new Date(),
        businessId: auth.currentUser?.uid,
        businessName: username || 'Unknown Business',
        likes: 0,
        shares: 0,
        views: 0
      };

      await setDoc(updateDocRef, payload);

      setHeading('');
      setContent('');
      setHashtags([]);
      setStartDate('');
      setEndDate('');
      setImages([]);
      setCategory('');
      setAiCategory('');
      setAreas([]);
      setTargetAudience('');
      setContactInfo('');

      alert('Update posted successfully');

    } catch (error) {
      console.error('Error posting update:', error);
      alert('Error posting update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Share Business Updates</h1>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gold/20 mb-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category (manual)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
              >
                <option value="">Select Category (or leave blank for AI suggestion)</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
              >
                <option value="">Select Target Audience</option>
                {targetOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Heading *</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Enter attention-grabbing heading"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
              />
              <button
                onClick={suggestHeading}
                className="px-3 py-2 bg-blue-600 rounded"
                disabled={loading}
              >
                AI Suggest
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Detailed Description *</label>
            <div className="flex gap-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your update in detail..."
                rows="4"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
              />
              <button
                onClick={suggestContent}
                className="px-3 py-2 bg-blue-600 rounded"
                disabled={loading}
              >
                AI Improve
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Contact Information</label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Phone, email, or address for inquiries"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gold/20 mb-6">
          <h2 className="text-xl font-bold mb-4">Promotional / Validity Period</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date / From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">End Date / To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload Images (Max 5)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelection}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
            {images.length > 0 && (
              <p className="text-green-400 text-sm mt-2">{images.length} image(s) selected</p>
            )}

            {/* previews */}
            <div className="flex flex-wrap gap-3 mt-3">
              {images.map((b64, i) => (
                <div key={i} className="relative">
                  <img src={b64} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gold/20 mb-6">
          <h2 className="text-xl font-bold mb-4">AI Suggestions & Social</h2>

          <div className="mb-4">
            <button
              onClick={suggestCategoryAndAreas}
              className="px-4 py-2 bg-purple-600 rounded mr-2"
              disabled={loading}
            >
              AI Classify (Category & Areas)
            </button>

            <button
              onClick={generateHashtags}
              className="px-4 py-2 bg-blue-600 rounded"
              disabled={loading || !heading.trim()}
            >
              {loading ? 'Working...' : 'Generate Hashtags'}
            </button>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">AI Suggested Category</label>
            <div className="inline-block bg-gray-700 px-3 py-1 rounded">{aiCategory || '—'}</div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">AI Suggested Areas / Tags</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {areas.length > 0 ? areas.map((a, idx) => (
                <span key={idx} className="bg-gray-700 px-3 py-1 rounded">{a}</span>
              )) : <span className="text-sm text-gray-400">No AI areas suggested</span>}
            </div>
          </div>

          {hashtags.length > 0 && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Hashtags</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {hashtags.map((tag, idx) => <span key={idx} className="bg-blue-600 px-3 py-1 rounded">{tag}</span>)}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-3 rounded-lg text-lg transition-colors disabled:opacity-60"
        >
          {loading ? 'Posting Update...' : 'Publish Update'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
