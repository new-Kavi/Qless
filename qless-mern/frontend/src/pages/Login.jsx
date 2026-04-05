import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { LogIn, User, CircleUserRound, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // user | seller | admin
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    // Auto-fill demo credentials for convenience
    if (selectedRole === 'user') setEmail('user@test.com');
    if (selectedRole === 'seller') setEmail('seller@test.com');
    if (selectedRole === 'admin') setEmail('admin@test.com');
    setPassword('123456');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await login(email, password);
      
      // Redirect based on role returned from the real API
      switch(user.role) {
        case 'seller':
          navigate('/seller');
          break;
        case 'admin':
          navigate('/admin');
          break;
        case 'user':
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      // Extract error message from Axios response
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-down">
        
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={32} color="var(--color-primary)" />
          </div>
          <h1>Welcome to QLess</h1>
          <p>Sign in to manage your queue seamlessly</p>
        </div>

        <div className="role-tabs">
          <button 
            type="button"
            className={`role-tab ${role === 'user' ? 'active' : ''}`}
            onClick={() => handleRoleChange('user')}
          >
            <User size={18} /> User
          </button>
          <button 
            type="button"
            className={`role-tab ${role === 'seller' ? 'active' : ''}`}
            onClick={() => handleRoleChange('seller')}
          >
            <CircleUserRound size={18} /> Seller
          </button>
          <button 
            type="button"
            className={`role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            <ShieldCheck size={18} /> Admin
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <Button fullWidth type="submit" variant="primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="login-footer">
          <p className="signup-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>

        <div className="demo-credentials">
          <p><strong>Demo Hint:</strong> Switch tabs to auto-fill dummy credentials.</p>
        </div>

      </div>
    </div>
  );
};

export default Login;
