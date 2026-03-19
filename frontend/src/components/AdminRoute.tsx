import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Allows access only to authenticated ADMIN users. */
const AdminRoute: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className='page-loading'>
        <span className='spinner' />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to='/login' replace />;
  if (user?.role !== 'ADMIN') return <Navigate to='/profile' replace />;

  return <Outlet />;
};

export default AdminRoute;
