// src/pages/SignIn.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = () => {
    if (!userId.trim()) {
      setError('Please enter your User ID');
      return;
    }
    navigate(`/dashboard/${userId.trim()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <input
        type="text"
        placeholder="Enter your User ID (e.g. U00001)"
        value={userId}
        onChange={(e) => { setUserId(e.target.value); setError(''); }}
        className="border p-2 rounded mb-4 w-64"
      />
      <button
        onClick={handleSignIn}
        className="px-6 py-3 bg-blue-600 text-white rounded"
      >
        Sign In
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default SignIn;