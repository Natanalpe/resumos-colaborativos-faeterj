import LoadingPage from '../components/Loading/LoadingPage';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

export function LoginRoute() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();

  if (loading) {
    return <LoadingPage />;
  }

  if (user) {
    const redirectPath = searchParams.get('redirect') || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}