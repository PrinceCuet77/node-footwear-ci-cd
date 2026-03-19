import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { extractErrors } from '../utils/error';
import FormErrors from '../components/FormErrors';

const RegisterPage: React.FC = () => {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authLoading && isAuthenticated) {
    return <Navigate to='/profile' replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError([]);
    setSuccessMsg('');
    setIsSubmitting(true);
    try {
      await register(email, password);
      setSuccessMsg('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(extractErrors(err, 'Registration failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='auth-page'>
      <div className='auth-card'>
        <h1 className='heading-primary'>Create account</h1>
        <p className='auth-subtitle'>Join Footwear today</p>

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
              placeholder='Min 6 chars, upper, lower, number, special'
              autoComplete='new-password'
              required
            />
          </div>

          {error.length > 0 && <FormErrors errors={error} />}
          {successMsg && <p className='form-success'>{successMsg}</p>}

          <button
            type='submit'
            className='btn-success btn-full'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className='auth-footer'>
          Already have an account?{' '}
          <Link to='/login' className='auth-link'>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default RegisterPage;
