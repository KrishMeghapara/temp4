import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography, Fade } from "@mui/material";
import { useCart } from "./CartContext";
import ProductCarousel from "./ProductCarousel";
import HeroSection from "./HeroSection";
import "./HomePage.css";

const API_BASE = "http://localhost:5236/api";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`${API_BASE}/Category`)
      .then(res => res.json())
      .then(async cats => {
        setCategories(cats);
        const prods = {};
        await Promise.all(
          cats.map(async cat => {
            const res = await fetch(`${API_BASE}/Product/ByCategory/${cat.categoryID}`);
            prods[cat.categoryID] = await res.json();
          })
        );
        setCategoryProducts(prods);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2,
        width: '100vw',
        bgcolor: 'transparent'
      }}>
        <CircularProgress size={60} sx={{ color: '#667eea' }} />
        <Typography variant="h6" color="text.secondary">
          Loading amazing products...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="main-bg" sx={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Box sx={{ width: '100vw', px: { xs: 0, md: 0 }, mb: 4 }}>
        <HeroSection />
      </Box>
      <Box className="maxw-1200 px-4" sx={{ py: 4 }}>
        {categories.map((cat, index) => (
          <Fade in={true} timeout={600 + index * 200} key={cat.categoryID}>
            <Box sx={{ mb: 6 }}>
              <ProductCarousel
                products={categoryProducts[cat.categoryID] || []}
                categoryName={cat.categoryName}
                onAddToCart={addToCart}
                onSeeAll={() => window.alert(`See all for ${cat.categoryName}`)}
              />
            </Box>
          </Fade>
        ))}
      </Box>
    </Box>
  );
} 