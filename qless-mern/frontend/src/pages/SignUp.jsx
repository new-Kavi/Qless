import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { UserPlus, User, CircleUserRound, ShieldCheck } from 'lucide-react';
import './Login.css'; // Reusing Login styles for consistency

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulate Signup (for demo we just say it's not fully implemented, use dummy login)
    setError('Sign up is disabled for this test demo. Please use the pre-defined demo credentials on the Login page.');
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-down">
        
        <div className="login-header">
          <div className="login-logo">
            <UserPlus size={32} color="var(--color-primary)" />
          </div>
          <h1>Create an Account</h1>
          <p>Join QLess to manage your waiting time</p>
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
            label="Full Name" 
            type="text" 
            placeholder="Enter your name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
          />
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
            placeholder="Create a password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <Button fullWidth type="submit" variant="primary">
            Sign Up
          </Button>
        </form>

        <div className="login-footer">
          <p className="signup-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default SignUp;
