import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, IconButton, Badge, Box, Container } from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import ProductGrid from "./components/ProductGrid";
import { useCart } from "./components/CartContext";
import CartDrawer from "./components/CartDrawer";
import HomePage from "./components/HomePage";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UserProfile from "./components/UserProfile";
import { useAuth } from "./components/AuthContext";
import AddAddressForm from "./components/AddAddressForm";
import ApiTest from "./components/ApiTest";
import PaymentPage from "./components/PaymentPage";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";

function AuthRoutes() {
  const { isAuthenticated, login, logout, user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [addressAdded, setAddressAdded] = useState(false); 
  const navigate = useNavigate();

  // Redirect to home when authenticated and user has address
  useEffect(() => {
    if (isAuthenticated && user && user.AddressID) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Redirect to home after login
  const handleLogin = (token, userData) => {
    login(token, userData);
    // No need to call navigate here, useEffect will handle it
  };

  if (isAuthenticated && (!user || !user.AddressID) && !addressAdded) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AddAddressForm onSuccess={() => setAddressAdded(true)} />
        <button onClick={logout} style={{ marginTop: 20 }}>Logout</button>
      </Box>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        <LoginForm onLogin={handleLogin} />
      } />
      <Route path="/register" element={
        <RegisterForm onRegister={() => navigate('/login')} />
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function MainApp() {
  const { cart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onItemAdded = () => setCartOpen(true);
    window.addEventListener('cart:itemAdded', onItemAdded);
    return () => window.removeEventListener('cart:itemAdded', onItemAdded);
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Header onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </Box>
  );
}

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      {isAuthenticated ? <MainApp /> : <AuthRoutes />}
    </Router>
  );
}