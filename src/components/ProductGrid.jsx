import "./ProductGrid.css";
import React, { useEffect, useState } from "react";
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  CardActionArea, 
  Box, 
  CircularProgress, 
  Button,
  Chip,
  Container,
  Fade,
  Skeleton
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useCart } from "./CartContext";

const API_BASE = "http://localhost:5236/api";
const PLACEHOLDER_IMG = "/placeholder.png";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/Product`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    addToCart(product);
    
    // Add visual feedback
    const button = event.currentTarget;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
      button.style.transform = '';
    }, 150);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" className="product-grid-container">
        <Box className="loading-container">
          <CircularProgress size={60} sx={{ color: '#667eea' }} />
          <Typography variant="h6" className="loading-text">
            Loading amazing products...
          </Typography>
        </Box>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card className="product-card skeleton-card">
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={28} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" className="product-grid-container">
        <Box className="error-container">
          <InventoryIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.location.reload()}
            sx={{ 
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              '&:hover': { transform: 'translateY(-2px)' }
            }}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container maxWidth="xl" className="product-grid-container">
        <Box className="empty-container">
          <InventoryIcon sx={{ fontSize: 80, color: '#9ca3af', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No products available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check back later for new arrivals!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" className="product-grid-container">
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          className="section-title"
          sx={{ 
            fontWeight: 900,
            background: 'linear-gradient(135deg, #1f2937, #4b5563)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          All Products
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Discover our complete collection of fresh products
        </Typography>
      </Box>

      <Grid container spacing={3} className="product-grid">
        {products.map((product, index) => {
          const imgSrc = product.productImg && product.productImg.startsWith('http')
            ? product.productImg
            : `/${product.productImg}`;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.productID}>
              <Fade in={true} timeout={600 + index * 100}>
                <Card className="product-card enhanced-card">
                  <Box className="product-badges">
                    {product.productPrice < 100 && (
                      <Chip 
                        icon={<LocalOfferIcon />}
                        label="Best Deal" 
                        size="small" 
                        className="deal-badge"
                      />
                    )}
                    {product.isInStock && (
                      <Chip 
                        icon={<VerifiedIcon />}
                        label="In Stock" 
                        size="small" 
                        className="stock-badge"
                      />
                    )}
                    {!product.isInStock && (
                      <Chip 
                        label="Out of Stock" 
                        size="small" 
                        className="out-of-stock-badge"
                      />
                    )}
                  </Box>

                  <CardActionArea className="card-action-area">
                    <CardMedia
                      component="img"
                      height="200"
                      image={imgSrc}
                      alt={product.productName}
                      className="product-image"
                      onError={e => { 
                        e.target.onerror = null; 
                        e.target.src = PLACEHOLDER_IMG; 
                      }}
                    />
                    <CardContent className="product-content">
                      <Box className="product-header">
                        <Typography 
                          gutterBottom 
                          variant="h6" 
                          component="div" 
                          className="product-name"
                        >
                          {product.productName}
                        </Typography>
                        <Chip 
                          label={product.categoryName} 
                          size="small" 
                          className="category-chip"
                        />
                      </Box>

                      <Box className="product-details">
                        <Typography 
                          variant="h5" 
                          className="product-price"
                        >
                          ₹{product.productPrice}
                        </Typography>
                        
                        <Box className="product-meta">
                          <Box className="delivery-info">
                            <span className="delivery-icon">⚡</span>
                            <Typography variant="body2" className="delivery-text">
                              12 min delivery
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<ShoppingCartIcon />}
                        onClick={(e) => handleAddToCart(product, e)}
                        disabled={!product.isInStock}
                        className="add-to-cart-btn"
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 700,
                          fontSize: '1rem',
                          textTransform: 'none',
                          background: product.isInStock 
                            ? 'linear-gradient(135deg, #10b981, #059669)' 
                            : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                          boxShadow: product.isInStock 
                            ? '0 4px 15px rgba(16, 185, 129, 0.3)' 
                            : 'none',
                          '&:hover': {
                            background: product.isInStock 
                              ? 'linear-gradient(135deg, #059669, #047857)' 
                              : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                            transform: product.isInStock ? 'translateY(-2px)' : 'none',
                            boxShadow: product.isInStock 
                              ? '0 8px 25px rgba(16, 185, 129, 0.4)' 
                              : 'none',
                          },
                          '&:disabled': {
                            color: 'white',
                            opacity: 0.7
                          }
                        }}
                      >
                        {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Fade>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}