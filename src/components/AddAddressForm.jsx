import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  Grid,
  InputAdornment,
  Fade,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  Modal
} from '@mui/material';
import { 
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Map as MapIcon,
  Save as SaveIcon,
  MyLocation as MyLocationIcon
} from '@mui/icons-material';
import { useAuth } from './AuthContext';
import AddressMap from './AddressMap';

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

const steps = ['Enter Details', 'Select Location', 'Confirm Address'];

const AddAddressForm = ({ onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const { token } = useAuth();
  const [fullAddress, setFullAddress] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // Validation states
  const [fieldErrors, setFieldErrors] = useState({});

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'house':
        if (!value.trim()) errors.house = 'House/Flat number is required';
        else if (value.length < 2) errors.house = 'House/Flat number too short';
        else delete errors.house;
        break;
      case 'street':
        if (!value.trim()) errors.street = 'Street/Area is required';
        else if (value.length < 3) errors.street = 'Street/Area too short';
        else delete errors.street;
        break;
      case 'city':
        if (!value.trim()) errors.city = 'City is required';
        else if (value.length < 2) errors.city = 'City name too short';
        else delete errors.city;
        break;
      case 'state':
        if (!value.trim()) errors.state = 'State is required';
        else if (value.length < 2) errors.state = 'State name too short';
        else delete errors.state;
        break;
      case 'pincode':
        if (!value.trim()) errors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(value)) errors.pincode = 'Pincode must be 6 digits';
        else delete errors.pincode;
        break;
      case 'phone':
        if (value && !/^\d{10}$/.test(value)) errors.phone = 'Phone must be 10 digits';
        else delete errors.phone;
        break;
      default:
        break;
    }
    
    setFieldErrors(errors);
  };

  const handleInputChange = (name, value) => {
    switch (name) {
      case 'house': setHouse(value); break;
      case 'street': setStreet(value); break;
      case 'landmark': setLandmark(value); break;
      case 'city': setCity(value); break;
      case 'state': setState(value); break;
      case 'pincode': setPincode(value); break;
      case 'phone': setPhone(value); break;
    }
    validateField(name, value);
  };

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude);
          setLng(longitude);
          setMapCenter({ lat: latitude, lng: longitude });
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            if (data && data.address) {
              setFullAddress(data.display_name);
              setCity(data.address.city || data.address.town || data.address.village || '');
              setState(data.address.state || '');
              setPincode(data.address.postcode || '');
              setStreet(data.address.road || '');
              setHouse(data.address.house_number || '');
              setLandmark(data.address.neighbourhood || data.address.suburb || '');
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
          
          setLocationLoading(false);
          setShowMap(true);
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.');
          setLocationLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLocationLoading(false);
    }
  };

  const handleOpenMap = async () => {
    if (!city || !state) return;
    setError('');
    try {
      const query = encodeURIComponent(`${city}, ${state}, India`);
      console.log('Geocoding query:', query);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await response.json();
      if (data && data[0]) {
        setMapCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setMapOpen(true);
      } else {
        setError('Could not find the city/state you entered. Please check your spelling or try a nearby city.');
      }
    } catch {
      setError('Error finding location. Please check your internet connection.');
    }
  };

  const handleMapSelect = async ({ lat, lng }) => {
    setLat(lat);
    setLng(lng);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.address) {
        setCity(data.address.city || data.address.town || data.address.village || city);
        setState(data.address.state || state);
        setPincode(data.address.postcode || pincode);
        setStreet(data.address.road || street);
        setHouse(data.address.house_number || house);
        setLandmark(data.address.neighbourhood || data.address.suburb || landmark);
        setFullAddress(data.display_name || '');
      } else {
        setError('Could not get address details for the selected location.');
      }
    } catch {
      setError('Error getting address details from map.');
    }
    setMapOpen(false);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate required fields
      const requiredFields = ['house', 'street', 'city', 'state', 'pincode'];
      const hasErrors = requiredFields.some(field => {
        const value = eval(field);
        validateField(field, value);
        return !value.trim();
      });
      
      if (hasErrors || Object.keys(fieldErrors).length > 0) {
        setError('Please fill in all required fields correctly');
        return;
      }
      // Instead of finding on map, just go to map step
      setActiveStep(1);
      setError('');
    } else if (activeStep === 1) {
      if (!lat || !lng) {
        setError('Please select a location on the map');
        return;
      }
      setActiveStep(2);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5236/api/Address/AddForCurrentUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ house, street, landmark, city, state, pincode, phone, lat, lng })
      });
      
      if (response.ok) {
        onSuccess && onSuccess();
      } else {
        const data = await response.json();
        setError(typeof data === 'string' ? data : data?.message || 'Failed to add address');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
              Enter Your Address Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="House/Flat/Building *"
                  value={house}
                  onChange={(e) => handleInputChange('house', e.target.value)}
                  error={!!fieldErrors.house}
                  helperText={fieldErrors.house}
                  className="address-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Street/Area/Locality *"
                  value={street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  error={!!fieldErrors.street}
                  helperText={fieldErrors.street}
                  className="address-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Landmark (Optional)"
                  value={landmark}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  className="address-input"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="City *"
                  value={city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                  className="address-input"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="State *"
                  value={state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state}
                  className="address-input"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pincode *"
                  value={pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                  error={!!fieldErrors.pincode}
                  helperText={fieldErrors.pincode}
                  className="address-input"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone}
                  className="address-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#667eea' }} />
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={locationLoading ? <CircularProgress size={20} /> : <MyLocationIcon />}
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="location-btn"
              >
                {locationLoading ? 'Getting Location...' : 'Use Current Location'}
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenMap}
                disabled={!city || !state}
                sx={{ mb: 2 }}
              >
                Open Map
              </Button>
            </Box>
          </Box>
        );
        
      case 1:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
              Select Your Location on Map
            </Typography>
            
            {fullAddress && (
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Current Address:</strong> {fullAddress}
                </Typography>
              </Alert>
            )}
            
            <Box className="map-container">
              <AddressMap 
                onAddressSelect={handleMapSelect} 
                center={mapCenter} 
                size={{ width: '100%', height: 400 }} 
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Click on the map to select your exact location
            </Typography>
          </Box>
        );
        
      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: '#1f2937', fontWeight: 600 }}>
              Confirm Your Address
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">House/Building</Typography>
                    <Typography variant="body1" fontWeight={600}>{house}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Street/Area</Typography>
                    <Typography variant="body1" fontWeight={600}>{street}</Typography>
                  </Grid>
                  {landmark && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Landmark</Typography>
                      <Typography variant="body1" fontWeight={600}>{landmark}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">City</Typography>
                    <Typography variant="body1" fontWeight={600}>{city}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">State</Typography>
                    <Typography variant="body1" fontWeight={600}>{state}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">Pincode</Typography>
                    <Typography variant="body1" fontWeight={600}>{pincode}</Typography>
                  </Grid>
                  {phone && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="body1" fontWeight={600}>{phone}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
            
            {fullAddress && (
              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Map Location:</strong> {fullAddress}
                </Typography>
              </Alert>
            )}
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box className="address-form-container">
      <Paper className="address-form-paper" elevation={0}>
        <Box className="address-form-header">
          <Typography variant="h4" className="form-title">
            Add Delivery Address
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please provide your complete address for accurate delivery
          </Typography>
        </Box>

        <Modal open={mapOpen} onClose={() => setMapOpen(false)}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, p: 2, borderRadius: 2 }}>
            <AddressMap
              center={mapCenter}
              onAddressSelect={({ lat, lng }) => handleMapSelect({ lat, lng })}
              size={{ width: 400, height: 400 }}
            />
            <Button onClick={() => setMapOpen(false)} sx={{ mt: 2 }}>Close</Button>
          </Box>
        </Modal>

        <Divider sx={{ mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        <Box className="step-content">
          {renderStepContent(activeStep)}
        </Box>

        <Box className="form-actions">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              className="submit-btn"
            >
              {loading ? 'Saving Address...' : 'Save Address'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={locationLoading}
              startIcon={locationLoading ? <CircularProgress size={20} /> : <MapIcon />}
              className="next-btn"
            >
              {locationLoading ? 'Loading...' : 'Next'}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AddAddressForm;