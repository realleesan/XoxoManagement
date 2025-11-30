import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import useAuthStore from '../store/authStore.js';

export const useAuth = () => {
  const navigate = useNavigate();
  const { token, setUser, setToken } = useAuthStore();

  useEffect(() => {
    // Load user info if token exists
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.user);
        } catch (error) {
          // Token invalid, clear it
          setToken(null);
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            navigate('/login');
          }
        }
      }
    };

    loadUser();
  }, [token, setUser, setToken, navigate]);

  return { token };
};

