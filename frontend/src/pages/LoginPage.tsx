import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { extractErrors } from '../utils/error';
import FormErrors from '../components/FormErrors';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to='/profile' replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError([]);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/profile', { replace: true });
    } catch (err) {
      setError(
        extractErrors(err, 'Login failed. Please check your credentials.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='auth-page'>
      <div className='auth-card'>
        <h1 className='heading-primary'>Welcome back</h1>
        <p className='auth-subtitle'>Sign in to your account</p>

        <form onSubmit={handleSubmit} className='auth-form' noValidate>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
              autoComplete='email'
              required
            />
          </div>

          <div className='form-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              autoComplete='current-password'
              required
            />
          </div>

          {error.length > 0 && <FormErrors errors={error} />}

          <button
            type='submit'
            className='btn-success btn-full'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className='auth-footer'>
          Don't have an account?{' '}
          <Link to='/register' className='auth-link'>
            Register
          </Link>
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
