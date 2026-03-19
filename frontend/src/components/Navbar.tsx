import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className='navbar'>
      <Link
        to={isAuthenticated ? '/profile' : '/login'}
        className='navbar-brand'
      >
        Footwear
      </Link>

      <div className='navbar-links'>
        {isAuthenticated ? (
          <>
            <Link to='/profile' className='nav-link'>
              Profile
            </Link>
            {user?.role === 'ADMIN' && (
              <Link to='/admin/users' className='nav-link'>
                Admin
              </Link>
            )}
            <span className='nav-user'>{user?.name || user?.email}</span>
            <button onClick={handleLogout} className='btn-danger btn-sm'>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to='/login' className='nav-link'>
              Login
            </Link>
            <Link to='/register' className='nav-link'>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
