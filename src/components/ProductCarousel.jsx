import React, { useRef } from 'react';
import { Chip } from '@mui/material';
import './ProductCarousel.css';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Button } from '@mui/material';

export default function ProductCarousel({ products, categoryName, onAddToCart, onSeeAll }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;
    const cardWidth = current.querySelector('.product-card')?.offsetWidth || 220;
    const scrollAmount = cardWidth * 2.5; // scroll by ~2.5 cards
    if (direction === 'left') {
      current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="category-section">
      <div className="category-header">
        <h2 className="category-title">{categoryName}</h2>
        <button className="see-all-btn" onClick={onSeeAll}>see all <ArrowForwardIosIcon fontSize="small" /></button>
      </div>
      <div className="carousel-wrapper">
        <button className="carousel-arrow left" onClick={() => scroll('left')}><ArrowBackIosNewIcon /></button>
        <div className="carousel-row" ref={scrollRef}>
          {products.map(prod => (
            <div className="product-card" key={prod.productID}>
              <div className="product-badges">
                {prod.productPrice < 100 && (
                  <Chip 
                    icon={<LocalOfferIcon />}
                    label="Best Deal" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#ef4444', 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                )}
                {!prod.isInStock && (
                  <Chip 
                    label="Out of Stock" 
                    size="small" 
                    sx={{ 
                      bgcolor: '#6b7280', 
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }} 
                  />
                )}
              </div>
              {prod.productImg && prod.productImg !== 'false' && (
                <img className="product-img" src={prod.productImg} alt={prod.productName} />
              )}
              <div className="product-meta">
                <div className="product-delivery"><span role="img" aria-label="clock">⏱️</span> 12 MINS</div>
                <div className="product-name">{prod.productName}</div>
                <div className="product-qty">{prod.productQty || ''}</div>
                <div className="product-price-row">
                  <span className="product-price">₹{prod.productPrice}</span>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddShoppingCartIcon />}
                    className="add-btn"
                    onClick={() => onAddToCart(prod)}
                    disabled={!prod.isInStock}
                    sx={{
                      borderColor: prod.isInStock ? '#10b981' : '#9ca3af',
                      color: prod.isInStock ? '#10b981' : '#9ca3af',
                      '&:hover': {
                        borderColor: prod.isInStock ? '#059669' : '#9ca3af',
                        backgroundColor: prod.isInStock ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                      }
                    }}
                  >
                    ADD
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-arrow right" onClick={() => scroll('right')}><ArrowForwardIosIcon /></button>
      </div>
    </div>
  );
} 