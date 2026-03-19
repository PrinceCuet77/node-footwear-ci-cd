import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        {/* Protected user routes */}
        <Route element={<PrivateRoute />}>
          <Route path='/profile' element={<ProfilePage />} />
        </Route>

        {/* Protected admin routes */}
        <Route element={<AdminRoute />}>
          <Route path='/admin/users' element={<AdminUsersPage />} />
        </Route>

        {/* Fallback */}
        <Route path='/' element={<Navigate to='/profile' replace />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  );
}

export default App;
