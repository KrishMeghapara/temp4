import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  IconButton,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Payment as PaymentIcon,
  CheckCircle as CheckIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  ShoppingCart as CartIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './PaymentPage.css';

const steps = ['Order Review', 'Shipping Details', 'Payment Method', 'Confirmation'];

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit/Debit Card',
    icon: <CreditCardIcon />,
    description: 'Pay securely with your card',
    color: '#3b82f6'
  },
  {
    id: 'upi',
    name: 'UPI Payment',
    icon: <PaymentIcon />,
    description: 'Pay using UPI apps like Google Pay, PhonePe',
    color: '#8b5cf6'
  },
  {
    id: 'net_banking',
    name: 'Net Banking',
    icon: <BankIcon />,
    description: 'Pay using your bank account',
    color: '#10b981'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: <ShippingIcon />,
    description: 'Pay when you receive your order',
    color: '#f59e0b'
  }
];

export default function PaymentPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [shippingDetails, setShippingDetails] = useState({
    fullName: user?.UserName || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressFilled, setAddressFilled] = useState(false);

  // Calculate totals
  const total = cart.reduce((sum, item) => sum + (item.product?.productPrice || 0) * item.quantity, 0);
  const shippingCost = total > 500 ? 0 : 50;
  const finalTotal = total + shippingCost;

  // Redirect if cart is empty and fetch user address
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    } else {
      fetchUserAddress();
    }
  }, [cart, navigate]);

  // Fetch user's address data
  const fetchUserAddress = async () => {
    try {
      setIsLoadingAddress(true);
      const response = await fetch('http://localhost:5236/api/Address/GetForCurrentUser', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const addressData = await response.json();
        // Auto-populate shipping details from user's address
        setShippingDetails({
          fullName: user?.UserName || '',
          phone: addressData.phone || '',
          address: `${addressData.house || ''} ${addressData.street || ''} ${addressData.landmark || ''}`.trim(),
          city: addressData.city || '',
          state: addressData.state || '',
          pincode: addressData.pincode || ''
        });
        setAddressFilled(true);
        // Auto-hide success message after 3 seconds
        setTimeout(() => setAddressFilled(false), 3000);
      } else if (response.status === 404) {
        // No address found - keep default values
        console.log('No address found for user');
        setError('No saved address found. Please fill in your shipping details manually.');
      } else {
        console.error('Failed to fetch address:', response.status);
        setError('Failed to load your saved address. Please fill in details manually.');
      }
          } catch (error) {
        console.error('Error fetching user address:', error);
        setError('Failed to load your saved address. Please fill in details manually.');
      } finally {
        setIsLoadingAddress(false);
      }
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate shipping details
      const required = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
      const missing = required.filter(field => !shippingDetails[field]);
      
      if (missing.length > 0) {
        setError(`Please fill in: ${missing.join(', ')}`);
        return;
      }
    }
    
    setError(null);
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePaymentSubmit = async () => {
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
        PaymentMethod: selectedPaymentMethod
      };

      const order = await apiService.createOrder(orderData);
      setOrderId(order.orderID || order.OrderID);
      setSuccess(true);
      setActiveStep(3);
      
      // Clear cart after successful order
      clearCart();
    } catch (error) {
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderReview = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1f2937' }}>
        Review Your Order
      </Typography>
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <List>
            {cart.map((item, index) => (
              <ListItem key={index} sx={{ 
                mb: 2, 
                bgcolor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e5e7eb'
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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Total:</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#10b981' }}>
              ₹{finalTotal}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderShippingDetails = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1f2937' }}>
        Shipping Information
      </Typography>
      
              {/* Auto-fill Address Button */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={fetchUserAddress}
            disabled={isLoadingAddress}
            startIcon={isLoadingAddress ? <CircularProgress size={16} /> : <LocationIcon />}
            sx={{
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': {
                borderColor: '#059669',
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
              }
            }}
          >
            {isLoadingAddress ? 'Loading...' : 'Auto-fill from My Address'}
          </Button>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Automatically fill shipping details from your saved address
          </Typography>
        </Box>
        
        {/* Success Message */}
        {addressFilled && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            ✅ Address details auto-filled successfully! You can edit them if needed.
          </Alert>
        )}
      
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={shippingDetails.fullName}
                onChange={(e) => setShippingDetails({...shippingDetails, fullName: e.target.value})}
                required
                disabled={isLoadingAddress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
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
                disabled={isLoadingAddress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
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
                disabled={isLoadingAddress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
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
                disabled={isLoadingAddress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
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
                disabled={isLoadingAddress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
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
                disabled={isLoadingAddress}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': { borderColor: '#10b981' },
                    '&.Mui-focused fieldset': { borderColor: '#10b981' },
                  },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderPaymentMethod = () => (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1f2937' }}>
        Choose Payment Method
      </Typography>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <Card
                  key={method.id}
                  sx={{
                    mb: 2,
                    border: selectedPaymentMethod === method.id ? `2px solid ${method.color}` : '1px solid #e5e7eb',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: method.color,
                      boxShadow: `0 4px 20px ${method.color}20`
                    }
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <FormControlLabel
                      value={method.id}
                      control={<Radio sx={{ color: method.color, '&.Mui-checked': { color: method.color } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ color: method.color }}>
                            {method.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937' }}>
                              {method.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {method.description}
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>
    </Box>
  );

  const renderConfirmation = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 3 
      }}>
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckIcon sx={{ fontSize: 40, color: 'white' }} />
        </Box>
      </Box>
      
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#10b981' }}>
        Order Placed Successfully!
      </Typography>
      
      <Typography variant="h6" sx={{ mb: 1, color: '#374151' }}>
        Order ID: #{orderId}
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: '#6b7280' }}>
        Thank you for your purchase. You'll receive an email confirmation shortly.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2 }}
        >
          Continue Shopping
        </Button>
        <Button
          variant="contained"
          startIcon={<CartIcon />}
          onClick={() => navigate('/')}
          sx={{
            bgcolor: '#10b981',
            borderRadius: 2,
            '&:hover': { bgcolor: '#059669' }
          }}
        >
          View Orders
        </Button>
      </Box>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderOrderReview();
      case 1:
        return renderShippingDetails();
      case 2:
        return renderPaymentMethod();
      case 3:
        return renderConfirmation();
      default:
        return 'Unknown step';
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#f8fafc',
      py: 4
    }} className="payment-page">
      <Container maxWidth="lg">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link
            color="inherit"
            href="#"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <CartIcon sx={{ mr: 0.5 }} fontSize="small" />
            Cart
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 0.5 }} fontSize="small" />
            Payment
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Secure Checkout
          </Typography>
          <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 400 }}>
            Complete your purchase in just a few steps
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Paper sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }} className="stepper-container">
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Main Content */}
        <Paper sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(145deg, #ffffff, #f8fafc)'
        }}>
          {getStepContent(activeStep)}

          {/* Navigation Buttons */}
          {activeStep < 3 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                sx={{ borderRadius: 2 }}
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep === 2 ? (
                  <Button
                    variant="contained"
                    onClick={handlePaymentSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <PaymentIcon />}
                    sx={{
                      bgcolor: '#10b981',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                      '&:hover': { 
                        bgcolor: '#059669',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                      }
                    }}
                  >
                    {loading ? 'Processing...' : 'Complete Payment'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      bgcolor: '#10b981',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                      '&:hover': { 
                        bgcolor: '#059669',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
                      }
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Security Notice */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
            <SecurityIcon sx={{ color: '#10b981', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Your payment information is secure and encrypted
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            We use industry-standard SSL encryption to protect your data
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
