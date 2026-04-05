import React, { createContext, useState, useContext, useEffect } from 'react';
import { loginUser as apiLogin, registerUser as apiRegister, fetchMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  // On mount, re-hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('qlUser');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
        // Verify token is still valid against the real API
        fetchMe()
          .then((res) => {
            setUser((prev) => ({ ...prev, ...res.data }));
          })
          .catch(() => {
            // Token invalid/expired — log out
            localStorage.removeItem('qlUser');
            setUser(null);
          });
      } catch {
        localStorage.removeItem('qlUser');
      }
    }

    // Restore bookings
    const storedBookings = localStorage.getItem('qlBookings');
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    localStorage.setItem('qlUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role = 'user') => {
    const { data } = await apiRegister({ name, email, password, role });
    localStorage.setItem('qlUser', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('qlUser');
    setUser(null);
  };

  const addBooking = (booking) => {
    const updated = [booking, ...bookings];
    setBookings(updated);
    localStorage.setItem('qlBookings', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, bookings, addBooking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
