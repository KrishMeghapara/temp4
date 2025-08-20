import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import { Payment as PaymentIcon, CheckCircle as CheckIcon } from '@mui/icons-material';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';

export default function SimpleCheckout({ onClose, onSuccess }) {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.UserName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.product?.productPrice || 0) * item.quantity, 0);
  const shippingCost = total > 500 ? 0 : 50;
  const finalTotal = total + shippingCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const required = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    const missing = required.filter(field => !shippingDetails[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        UserID: user.UserID,
        TotalAmount: finalTotal,
        ShippingCost: shippingCost,
        Items: cart.map(item => ({
          ProductID: item.productID,
          Quantity: item.quantity,
          Price: item.product?.productPrice || 0
        })),
        ShippingAddress: {
          FullName: shippingDetails.fullName,
          Phone: shippingDetails.phone,
          Address: shippingDetails.address,
          City: shippingDetails.city,
          State: shippingDetails.state,
          Pincode: shippingDetails.pincode
        },
        PaymentMethod: 'cod' // Cash on delivery for now
      };

      const order = await apiService.createOrder(orderData);
      setOrderId(order.orderID || order.OrderID);
      setSuccess(true);
      
      // Clear cart after successful order
      clearCart();
      
      if (onSuccess) {
        onSuccess(order);
      }
    } catch (error) {
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <CheckIcon sx={{ fontSize: 64, color: '#10b981', mb: 2 }} />
        <Typography variant="h4" sx={{ mb: 2, color: '#10b981' }}>
          Order Placed Successfully!
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Order ID: #{orderId}
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Thank you for your purchase. You'll receive an email confirmation shortly.
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            bgcolor: '#10b981',
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper sx={{ 
        p: 4, 
        borderRadius: 3,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)'
      }}>
        <Typography variant="h4" sx={{ 
          mb: 4, 
          textAlign: 'center', 
          fontWeight: 700,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Checkout
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ 
            mb: 3, 
            fontWeight: 700,
            color: '#374151',
            borderBottom: '2px solid #e5e7eb',
            pb: 1
          }}>
            Order Summary
          </Typography>
          <List>
            {cart.map((item, index) => (
              <ListItem key={index} sx={{ 
                mb: 2, 
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.04)'
              }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: '#10b981',
                    color: 'white',
                    fontWeight: 700
                  }}>
                    {item.product?.productName?.charAt(0) || '?'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937' }}>
                      {item.product?.productName || 'Product Name Unavailable'}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
                      Quantity: {item.quantity} × ₹{item.product?.productPrice || 0}
                    </Typography>
                  }
                />
                <Typography variant="h6" sx={{ 
                  fontWeight: 700,
                  color: '#10b981'
                }}>
                  ₹{(item.product?.productPrice || 0) * item.quantity}
                </Typography>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>₹{total}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Shipping:</Typography>
            <Typography>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
              ₹{finalTotal}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ 
            mb: 3, 
            fontWeight: 700,
            color: '#374151',
            borderBottom: '2px solid #e5e7eb',
            pb: 1
          }}>
            Shipping Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={shippingDetails.fullName}
                onChange={(e) => setShippingDetails({...shippingDetails, fullName: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={shippingDetails.phone}
                onChange={(e) => setShippingDetails({...shippingDetails, phone: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={shippingDetails.address}
                onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                value={shippingDetails.city}
                onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                value={shippingDetails.state}
                onChange={(e) => setShippingDetails({...shippingDetails, state: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Pincode"
                value={shippingDetails.pincode}
                onChange={(e) => setShippingDetails({...shippingDetails, pincode: e.target.value})}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: '#10b981',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#10b981',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || cart.length === 0}
              startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
              sx={{
                flex: 1,
                bgcolor: '#10b981',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.1rem',
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                '&:hover': { 
                  bgcolor: '#059669',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                },
                '&:disabled': {
                  bgcolor: '#9ca3af',
                  color: 'white',
                  transform: 'none',
                  boxShadow: 'none'
                }
              }}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
} 