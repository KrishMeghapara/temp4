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
  Chip
} from '@mui/material';
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import './UserProfile.css';
import AddAddressForm from './AddAddressForm';

const API_BASE_URL = 'http://localhost:5236/api';

export default function UserProfile() {
  const { user, token } = useAuth();
  const [address, setAddress] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    house: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  // Fetch user's address on component mount
  useEffect(() => {
    fetchUserAddress();
  }, []);

  const fetchUserAddress = async () => {
    try {
      setIsLoading(true);
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
        throw new Error('Failed to fetch address');
      }
    } catch (error) {
      setError('Failed to load address information');
      console.error('Error fetching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const endpoint = address 
        ? `${API_BASE_URL}/Address/UpdateForCurrentUser`
        : `${API_BASE_URL}/Address/AddForCurrentUser`;

      const method = address ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedAddress = await response.json();
        setAddress(savedAddress);
        setIsEditing(false);
        setSuccess(address ? 'Address updated successfully!' : 'Address added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Try to parse JSON, fallback to text
        let errorMsg = 'Failed to save address';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      house: address?.house || '',
      street: address?.street || '',
      landmark: address?.landmark || '',
      city: address?.city || '',
      state: address?.state || '',
      pincode: address?.pincode || '',
      phone: address?.phone || ''
    });
    setError('');
  };

  const handleDeleteAddress = async () => {
    if (!address?.addressID && !address?.addressId && !address?.AddressID) return;
    setError('');
    setSuccess('');
    try {
      const id = address.addressID || address.addressId || address.AddressID;
      const response = await fetch(`${API_BASE_URL}/Address/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setAddress(null);
        setSuccess('Address deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        let errorMsg = 'Failed to delete address';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMsg = await response.text();
        }
        throw new Error(errorMsg);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <Box className="main-bg" sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="main-bg" sx={{ width: '100vw', minHeight: '80vh', px: { xs: 1, sm: 2, md: 4 }, py: { xs: 2, sm: 4 }, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* User Info Section */}
      <Box className="maxw-1200 px-4" sx={{ mb: 4, width: '100%' }}>
        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
            <PersonIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {user?.userName || 'User Profile'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
      </Box>

      {/* Address Section */}
      <Box className="maxw-1200 px-4" sx={{ width: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon color="primary" />
            <Typography variant="h5" fontWeight="600">
              Address Information
            </Typography>
          </Box>
          {!isEditing && (
            <Button
              variant="outlined"
              startIcon={address ? <EditIcon /> : <AddIcon />}
              onClick={() => setIsEditing(true)}
              sx={{ borderRadius: 2 }}
            >
              {address ? 'Edit Address' : 'Add Address'}
            </Button>
          )}
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Address Display/Edit Form */}
        {isEditing && !address ? (
          <AddAddressForm onSuccess={() => { setIsEditing(false); fetchUserAddress(); }} />
        ) : isEditing && address ? (
              <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {address ? 'Edit Your Address' : 'Add Your Address'}
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="House/Flat/Building"
                      name="house"
                      value={formData.house}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Street/Area/Locality"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Landmark (optional)"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone (optional)"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Box display="flex" gap={2} sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={isSaving}
                    sx={{ borderRadius: 2 }}
                  >
                    {isSaving ? 'Saving...' : 'Save Address'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Card>
            ) : (
              <Card variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                {address ? (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Current Address
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            House/Flat/Building
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.house}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Street/Area/Locality
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.street}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Landmark
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.landmark}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            City
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.city}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            State
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.state}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Pincode
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.pincode}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Phone
                          </Typography>
                          <Typography variant="body1" fontWeight="500">
                            {address.phone}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box display="flex" gap={2} sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteAddress}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete Address
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <LocationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      No Address Added
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add your address to complete your profile
                    </Typography>
                  </Box>
                )}
              </Card>
            )}
      </Box>
    </Box>
  );
} 