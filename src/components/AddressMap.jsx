import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Button,
  Paper,
  Fade
} from '@mui/material';
import { 
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function AddressMap({ onAddressSelect, center, size }) {
  const mapRef = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  
  const defaultSize = { width: 300, height: 200 };
  const mapSize = size || defaultSize;
  const mapWidth = mapSize.width === '100%' ? '100%' : mapSize.width;
  const mapHeight = mapSize.height || 400;

  // Fix map size issues
  useEffect(() => {
    const fixMap = () => {
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current.invalidateSize();
        }, 100);
      }
    };

    const timeout = setTimeout(fixMap, 800);
    window.addEventListener('resize', fixMap);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', fixMap);
    };
  }, []);

  // Pan to center if it changes
  useEffect(() => {
    if (mapRef.current && center && mapReady) {
      mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom());
    }
  }, [center, mapReady]);

  const reverseGeocode = useCallback(async (lat, lng) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get address information');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return {
          address: data.display_name,
          details: data.address || {}
        };
      } else {
        throw new Error('No address found for this location');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setError('Failed to get address for this location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  function LocationMarker({ onSelect }) {
    const [position, setPosition] = useState(null);
    const [address, setAddress] = useState('');
    const [markerLoading, setMarkerLoading] = useState(false);

    const map = useMapEvents({
      click: async (e) => {
        setMarkerLoading(true);
        setPosition(e.latlng);
        
        const result = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        
        if (result) {
          setAddress(result.address);
          onSelect && onSelect({
            address: result.address,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            details: result.details
          });
        }
        
        setMarkerLoading(false);
      },
    });

    return position ? (
      <Marker position={position} icon={customIcon}>
        <Popup>
          <Box sx={{ minWidth: 200, p: 1 }}>
            {markerLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Getting address...</Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Selected Location
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  {address || 'Address not available'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                </Typography>
              </Box>
            )}
          </Box>
        </Popup>
      </Marker>
    ) : null;
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          setLoading(false);
        },
        (error) => {
          setError('Unable to get your current location');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  return (
    <Paper 
      elevation={3}
      sx={{ 
        minHeight: mapHeight + 60, 
        width: mapWidth, 
        minWidth: 280, 
        maxWidth: 800, 
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        position: 'relative'
      }}
    >
      {/* Map Header */}
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Select Location
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <MyLocationIcon />}
          onClick={getCurrentLocation}
          disabled={loading}
          sx={{
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          {loading ? 'Locating...' : 'My Location'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Fade in={true}>
          <Alert 
            severity="error" 
            sx={{ m: 2, borderRadius: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Map Container */}
      <Box sx={{ position: 'relative', height: mapHeight }}>
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1000
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#667eea', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading map...
              </Typography>
            </Box>
          </Box>
        )}

        <MapContainer 
          center={center || { lat: 28.6139, lng: 77.2090 }} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          whenCreated={(mapInstance) => { 
            mapRef.current = mapInstance;
            setMapReady(true);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onSelect={onAddressSelect} />
        </MapContainer>
      </Box>

      {/* Instructions */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: 'rgba(102, 126, 234, 0.05)',
        borderTop: '1px solid rgba(102, 126, 234, 0.1)'
      }}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          📍 Click anywhere on the map to select your delivery location
        </Typography>
      </Box>
    </Paper>
  );
}