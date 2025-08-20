import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Badge,
  Fade,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ShoppingBag as OrderIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Star as StarIcon,
  CalendarToday as DateIcon,
  AttachMoney as PriceIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import './UserProfile.css';
import AddAddressForm from './AddAddressForm';
import apiService from '../services/apiService';

const API_BASE_URL = 'http://localhost:5236/api';

export default function UserProfile() {
  const { user, token, updateUser } = useAuth();
  const { cart } = useCart();
  const [address, setAddress] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    house: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  // Fetch user's data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch address, orders, and profile in parallel
      const [addressResponse, ordersResponse, profileResponse] = await Promise.allSettled([
        fetchUserAddress(),
        fetchUserOrders(),
        fetchUserProfile()
      ]);

      // Handle address response
      if (addressResponse.status === 'fulfilled') {
        // Address is already set in fetchUserAddress
      } else {
        console.error('Failed to fetch address:', addressResponse.reason);
      }

      // Handle orders response
      if (ordersResponse.status === 'fulfilled') {
        // Orders are already set in fetchUserOrders
      } else {
        console.error('Failed to fetch orders:', ordersResponse.reason);
      }

      // Handle profile response
      if (profileResponse.status === 'fulfilled') {
        // Profile is already updated in fetchUserProfile
      } else {
        console.error('Failed to fetch profile:', profileResponse.reason);
      }

    } catch (error) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserAddress = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Address/GetForCurrentUser`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const addressData = await response.json();
        setAddress(addressData);
        setFormData({
          house: addressData.house || '',
          street: addressData.street || '',
          landmark: addressData.landmark || '',
          city: addressData.city || '',
          state: addressData.state || '',
          pincode: addressData.pincode || '',
          phone: addressData.phone || ''
        });
      } else if (response.status === 404) {
        setAddress(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch address');
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      throw error;
    }
  };

  const fetchUserOrders = async () => {
    try {
      if (!user?.UserID) return;

      const response = await fetch(`${API_BASE_URL}/Order/User/${user.UserID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const ordersData = await response.json();
        setOrders(ordersData);
      } else if (response.status === 404) {
        setOrders([]);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      throw error;
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/User/Profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const profileData = await response.json();
        // Update the user context with fresh profile data
        updateUser(profileData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAddress = async () => {
    try {
      setIsSaving(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/Address/UpdateForCurrentUser`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess('Address updated successfully!');
        setIsEditing(false);
        await fetchUserAddress(); // Refresh data
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update address');
      }
    } catch (error) {
      setError(error.message || 'Failed to update address');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      // Call API to change password
      const response = await fetch(`${API_BASE_URL}/User/ChangePassword`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setShowPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      setError(error.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'success';
      case 'shipped': return 'info';
      case 'processing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <CheckIcon />;
      case 'shipped': return <ShippingIcon />;
      case 'processing': return <CircularProgress size={16} />;
      case 'cancelled': return <CancelIcon />;
      default: return <OrderIcon />;
    }
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <CircularProgress size={60} sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ 
          fontWeight: 700, 
          mb: 1,
          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Fade in={true} timeout={600}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                {/* Profile Picture */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                  <Avatar 
                    src={user?.googlePicture} 
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mx: 'auto',
                      border: '4px solid #fff',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                      bgcolor: 'primary.main'
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                </Box>

                {/* User Info */}
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {user?.UserName || 'User Name'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {user?.Email || 'user@example.com'}
                </Typography>

                {/* Google User Badge */}
                {user?.isGoogleUser && (
                  <Chip 
                    icon={<CheckIcon />} 
                    label="Google Account" 
                    color="success" 
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                )}

                {/* Quick Stats */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {orders.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Orders
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {cart.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cart Items
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {address ? '✓' : '✗'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Address
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Quick Actions */}
          <Fade in={true} timeout={800}>
            <Card sx={{ 
              mt: 3, 
              borderRadius: 3, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {!user?.isGoogleUser && (
                    <Button
                      startIcon={<SecurityIcon />}
                      onClick={() => setShowPasswordDialog(true)}
                      sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                    >
                      Change Password
                    </Button>
                  )}
                  <Button
                    startIcon={<NotificationsIcon />}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    Notification Settings
                  </Button>
                  <Button
                    startIcon={<SettingsIcon />}
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    Account Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Right Column - Content */}
        <Grid item xs={12} md={8}>
          <Fade in={true} timeout={1000}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
              backdropFilter: 'blur(10px)'
            }}>
              <CardContent sx={{ p: 0 }}>
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem'
                      }
                    }}
                  >
                    <Tab label="Personal Info" icon={<PersonIcon />} iconPosition="start" />
                    <Tab label="Address" icon={<LocationIcon />} iconPosition="start" />
                    <Tab label="Orders" icon={<OrderIcon />} iconPosition="start" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: 4 }}>
                  {/* Personal Info Tab */}
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Personal Information
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Full Name"
                            value={user?.UserName || ''}
                            disabled
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            value={user?.Email || ''}
                            disabled
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            {user?.isGoogleUser 
                              ? 'Profile information is managed through your Google account.'
                              : 'Contact support to update your profile information.'
                            }
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

                  {/* Address Tab */}
                  {activeTab === 1 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Shipping Address
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setShowAddressDialog(true)}
                          sx={{ borderRadius: 2 }}
                        >
                          Add Address
                        </Button>
                      </Box>

                      {address ? (
                        <Card sx={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 2,
                          background: 'rgba(102, 126, 234, 0.02)'
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                  {formData.house}, {formData.street}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {formData.landmark && `${formData.landmark}, `}
                                  {formData.city}, {formData.state} {formData.pincode}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Phone: {formData.phone}
                                </Typography>
                              </Box>
                              <IconButton
                                onClick={() => setIsEditing(!isEditing)}
                                sx={{ color: 'primary.main' }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Box>

                            {isEditing && (
                              <Box sx={{ mt: 3 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="House/Flat No."
                                      name="house"
                                      value={formData.house}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={6}>
                                    <TextField
                                      fullWidth
                                      label="Street"
                                      name="street"
                                      value={formData.street}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Landmark"
                                      name="landmark"
                                      value={formData.landmark}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <TextField
                                      fullWidth
                                      label="City"
                                      name="city"
                                      value={formData.city}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <TextField
                                      fullWidth
                                      label="State"
                                      name="state"
                                      value={formData.state}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12} sm={4}>
                                    <TextField
                                      fullWidth
                                      label="Pincode"
                                      name="pincode"
                                      value={formData.pincode}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12}>
                                    <TextField
                                      fullWidth
                                      label="Phone"
                                      name="phone"
                                      value={formData.phone}
                                      onChange={handleInputChange}
                                      size="small"
                                    />
                                  </Grid>
                                  <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                      <Button
                                        variant="contained"
                                        onClick={handleSaveAddress}
                                        disabled={isSaving}
                                        startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                                        sx={{
                                          background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                          '&:hover': {
                                            background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)'
                                          }
                                        }}
                                      >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                      <Button
                                        variant="outlined"
                                        onClick={() => setIsEditing(false)}
                                      >
                                        Cancel
                                      </Button>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4,
                          border: '2px dashed #e0e0e0',
                          borderRadius: 2
                        }}>
                          <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            No Address Added
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Add your shipping address to make checkout faster
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setShowAddressDialog(true)}
                            sx={{
                              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)'
                              }
                            }}
                          >
                            Add Address
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Orders Tab */}
                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Order History
                      </Typography>
                      {orders.length > 0 ? (
                        <List sx={{ p: 0 }}>
                          {orders.map((order, index) => (
                            <Card key={order.orderID} sx={{ 
                              mb: 2, 
                              border: '1px solid #e0e0e0',
                              borderRadius: 2
                            }}>
                              <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      Order #{order.orderID}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatOrderDate(order.orderDate)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'right' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                      ${order.totalAmount}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                                </Typography>
                                {order.items && order.items.length > 0 && (
                                  <Box sx={{ mb: 2 }}>
                                    {order.items.map((item, itemIndex) => (
                                      <Box key={itemIndex} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2">
                                          {item.product?.productName || 'Product'} x {item.quantity}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          ${item.priceAtTime}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                )}
                                <Box sx={{ mt: 2 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{ mr: 1 }}
                                  >
                                    View Details
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                  >
                                    Track Order
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4,
                          border: '2px dashed #e0e0e0',
                          borderRadius: 2
                        }}>
                          <OrderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            No Orders Yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Start shopping to see your order history here
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>

      {/* Address Dialog */}
      <Dialog 
        open={showAddressDialog} 
        onClose={() => setShowAddressDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <AddAddressForm onSuccess={() => {
            setShowAddressDialog(false);
            fetchUserAddress();
          }} />
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog 
        open={showPasswordDialog} 
        onClose={() => setShowPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPasswordDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={isSaving}
            sx={{
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)'
              }
            }}
          >
            {isSaving ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 