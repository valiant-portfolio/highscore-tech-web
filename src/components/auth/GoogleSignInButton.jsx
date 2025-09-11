import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

const GoogleSignInButton = ({ isSignUp = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google credential to your backend
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      const { token, user } = response.data;
      
      // Store the token
      localStorage.setItem('token', token);
      
      // Update auth context
      login(user);
      
      // Redirect to dashboard or home
      navigate('/dashboard');
      
      toast.success(`Welcome, ${user.firstName || user.email}!`);
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error(error.response?.data?.message || 'Failed to sign in with Google');
    }
  };

  const handleGoogleError = () => {
    console.log('Google Sign In was unsuccessful');
    toast.error('Failed to sign in with Google');
  };

  if (!clientId) {
    console.error('Google Client ID is not configured');
    return null;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full">
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap={true}
            auto_select={false}
            text={isSignUp ? "signup_with" : "signin_with"}
            size="large"
            width="100%"
            shape="rectangular"
            theme="outline"
            logo_alignment="left"
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignInButton;
