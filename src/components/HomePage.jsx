import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Container, Typography, Fade, Alert } from "@mui/material";
import { useCart } from "./CartContext";
import ProductCarousel from "./ProductCarousel";
import HeroSection from "./HeroSection";
import apiService from "../services/apiService";
import "./HomePage.css";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        console.log('Loading categories...');
        const categories = await apiService.getCategories();
        console.log('Categories loaded:', categories);
        setCategories(categories);
        
        const prods = {};
        await Promise.all(
          categories.map(async cat => {
            try {
              console.log(`Loading products for category ${cat.categoryID}...`);
              const products = await apiService.getProductsByCategory(cat.categoryID);
              console.log(`Products for category ${cat.categoryID}:`, products);
              prods[cat.categoryID] = products;
            } catch (error) {
              console.error(`Failed to load products for category ${cat.categoryID}:`, error);
              prods[cat.categoryID] = [];
            }
          })
        );
        setCategoryProducts(prods);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
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

  if (error) {
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
        <Alert severity="error" sx={{ maxWidth: 600 }}>
          <Typography variant="h6">Failed to load data</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="main-bg" sx={{ minHeight: '100vh', width: '100vw', overflowX: 'hidden', boxSizing: 'border-box' }}>
      <Box sx={{ width: '100vw', px: { xs: 0, md: 0 }, mb: 4 }}>
        <HeroSection />
      </Box>
      <Box className="maxw-1200 px-4" sx={{ py: 4 }}>
        {categories.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary">
              No categories found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Please check your database connection and ensure categories are available.
            </Typography>
          </Box>
        ) : (
          categories.map((cat, index) => (
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
          ))
        )}
      </Box>
    </Box>
  );
} 