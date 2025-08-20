import React, { useState } from "react";
import { 
  Drawer, 
  Box, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Button, 
  Divider, 
  Input,
  Avatar,
  Chip
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentIcon from '@mui/icons-material/Payment';
import { useCart } from "./CartContext";
import { useNavigate } from 'react-router-dom';
import "./CartDrawer.css";

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQuantity, clearCart, loading, error } = useCart();
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + (item.product?.productPrice || 0) * item.quantity, 0);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ 
        width: { xs: '100vw', sm: 380 }, 
        maxWidth: '100vw',
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ShoppingBagIcon sx={{ mr: 1, color: '#667eea' }} />
          <Typography 
            variant="h5" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Shopping Cart
          </Typography>
          <Chip 
            label={`${cart.length} items`} 
            size="small" 
            sx={{ 
              bgcolor: '#667eea', 
              color: 'white',
              fontWeight: 600,
              mr: 1
            }} 
          />
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {loading ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: '#6b7280'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Loading cart...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: '#ef4444'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Error loading cart</Typography>
              <Typography variant="body2">{error}</Typography>
            </Box>
          ) : cart.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 6,
              color: '#6b7280'
            }}>
              <ShoppingBagIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>Your cart is empty</Typography>
              <Typography variant="body2">Add some products to get started!</Typography>
            </Box>
          ) : cart.map(item => (
            <ListItem 
              key={item.cartID} 
              alignItems="flex-start"
              sx={{ 
                mb: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)'
              }}
            >
              <Avatar 
                sx={{ 
                  mr: 2, 
                  bgcolor: '#f3f4f6',
                  color: '#667eea',
                  width: 48,
                  height: 48
                }}
              >
                {item.product?.productName?.charAt(0) || 'P'}
              </Avatar>
              <ListItemText
                primary={<>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937' }}>
                    {item.product?.productName || 'Product'}
                  </Typography>
                  <Chip 
                    label={`x${item.quantity}`} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#e5e7eb', 
                      color: '#374151',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      ml: 1
                    }} 
                  />
                </>}
                secondary={
                  <>
                    <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 600 }}>
                      ₹{item.product?.productPrice || 0} each
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.product?.category?.categoryName || 'Category'}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Input
                  type="number"
                  value={item.quantity}
                  inputProps={{ 
                    min: 1, 
                    style: { 
                      width: 50, 
                      textAlign: 'center',
                      fontWeight: 600
                    } 
                  }}
                  onChange={e => updateQuantity(item.cartID, Math.max(1, Number(e.target.value)))}
                  sx={{ 
                    mr: 1,
                    '& .MuiInput-input': {
                      borderRadius: 1,
                      border: '1px solid #e5e7eb',
                      padding: '4px 8px'
                    }
                  }}
                />
                <IconButton 
                  edge="end" 
                  onClick={() => removeFromCart(item.cartID)}
                  sx={{ 
                    color: '#ef4444',
                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Total: ₹{total}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          fullWidth 
          disabled={cart.length === 0} 
          startIcon={<PaymentIcon />}
          onClick={() => {
            onClose();
            navigate('/payment');
          }}
          sx={{ 
            mb: 2,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            fontWeight: 700,
            fontSize: '1.1rem',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8, #6b46c1)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            }
          }}
        >
          Proceed to Payment
        </Button>
        <Button 
          variant="outlined" 
          fullWidth 
          onClick={clearCart} 
          disabled={cart.length === 0}
          sx={{
            borderColor: '#ef4444',
            color: '#ef4444',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': {
              borderColor: '#dc2626',
              backgroundColor: 'rgba(239, 68, 68, 0.04)',
            }
          }}
        >
          Clear Cart
        </Button>
      </Box>
    </Drawer>
  );
} 