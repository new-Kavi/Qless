import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Button from './Button';
import { LogOut, UserCircle } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="nav-brand">
          <div className="nav-logo"></div>
          <span>QLess</span>
        </Link>
        
        <div className="nav-actions">
          {user && (
            <div className="user-info">
              <span className="user-role-badge">
                {user.role}
              </span>
              <div className="user-profile">
                <UserCircle size={20} className="profile-icon" />
                <span className="user-name">{user.name}</span>
              </div>
              <Button variant="outline" className="logout-btn" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
