import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PostDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state || {};

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Post not found.</h1>
        <button
          onClick={() => navigate('/explore')}
          className="bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded transition-colors"
        >
          Go Back to Explore
        </button>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800/50 rounded-xl p-6 border border-gold/20 shadow-xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Explore
        </button>
        <h1 className="text-4xl font-bold text-gold mb-2">{post.heading}</h1>
        <div className="flex items-center gap-2 text-gray-400 mb-4">
          <span className="text-sm">Posted by: {post.businessName || 'Unknown'}</span>
          <span className="text-xs">•</span>
          <span className="text-sm">
            {formatDate(post.createdAt)}
          </span>
        </div>
        
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {post.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${post.heading} image ${index + 1}`}
                className="w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Details</h2>
          <p className="text-gray-300">{post.content}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-blue-400">Post Information</h3>
            <p className="text-sm text-gray-300">
              <strong>Category:</strong> {post.category || 'N/A'}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Target Audience:</strong> {post.targetAudience || 'N/A'}
            </p>
            {post.areas && post.areas.length > 0 && (
              <p className="text-sm text-gray-300">
                <strong>Areas:</strong> {post.areas.join(', ')}
              </p>
            )}
            {post.startDate && (
              <p className="text-sm text-gray-300">
                <strong>Dates:</strong> {post.startDate} to {post.endDate || 'N/A'}
              </p>
            )}
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-green-400">Contact & Social</h3>
            <p className="text-sm text-gray-300">
              <strong>Contact:</strong> {post.contactInfo || 'N/A'}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {post.hashtags?.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-700/50 px-2 py-1 rounded-full text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostDetails;