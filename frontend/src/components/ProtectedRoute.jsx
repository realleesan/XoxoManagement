import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

function ProtectedRoute({ children }) {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;

