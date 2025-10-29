// Leaflet Map component with interactive location selection - Fixed version
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick, isSelecting }) {
  useMapEvents({
    click: (e) => {
      if (isSelecting) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

// Custom routing component without leaflet-routing-machine
// Update only the RouteDisplay component in LeafletMap.js

// Custom routing component with rate limiting
function RouteDisplay({ pickupLocation, dropLocation, onRouteFound }) {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    if (!pickupLocation || !dropLocation) {
      setRouteCoordinates([]);
      return;
    }

    const fetchRoute = async () => {
      // Rate limiting - wait at least 2 seconds between requests
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      if (timeSinceLastFetch < 2000) {
        setTimeout(() => fetchRoute(), 2000 - timeSinceLastFetch);
        return;
      }

      setIsLoading(true);
      setLastFetchTime(now);

      try {
        // Using OSRM demo server for routing with error handling
        const url = `https://router.project-osrm.org/route/v1/driving/${pickupLocation.lng},${pickupLocation.lat};${dropLocation.lng},${dropLocation.lat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        
        if (response.status === 429) {
          console.warn('Rate limit reached. Using straight line for now.');
          // Fallback to straight line if rate limited
          setRouteCoordinates([
            [pickupLocation.lat, pickupLocation.lng],
            [dropLocation.lat, dropLocation.lng]
          ]);
          
          // Calculate approximate distance
          const distance = calculateDistance(
            pickupLocation.lat, 
            pickupLocation.lng, 
            dropLocation.lat, 
            dropLocation.lng
          );
          
          onRouteFound({
            distance: `~${distance} km`,
            duration: `~${Math.round(distance * 2)} mins` // Rough estimate
          });
          return;
        }

        if (!response.ok) {
          throw new Error('Route fetch failed');
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoordinates(coordinates);

          // Calculate distance and duration
          const distance = (route.distance / 1000).toFixed(2);
          const duration = Math.round(route.duration / 60);
          
          onRouteFound({
            distance: `${distance} km`,
            duration: `${duration} mins`
          });
        }
      } catch (error) {
        console.warn('Using fallback route display:', error.message);
        // Fallback to straight line
        setRouteCoordinates([
          [pickupLocation.lat, pickupLocation.lng],
          [dropLocation.lat, dropLocation.lng]
        ]);
        
        const distance = calculateDistance(
          pickupLocation.lat, 
          pickupLocation.lng, 
          dropLocation.lat, 
          dropLocation.lng
        );
        
        onRouteFound({
          distance: `~${distance} km`,
          duration: `~${Math.round(distance * 2)} mins`
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoute();
  }, [pickupLocation, dropLocation, onRouteFound, lastFetchTime]);

  // Helper function to calculate distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  if (!routeCoordinates.length) return null;

  return (
    <Polyline
      positions={routeCoordinates}
      color="#4285F4"
      weight={5}
      opacity={0.8}
    />
  );
}


// Location search component
const LocationSearch = ({ onLocationSelect, placeholder, value }) => {
  const [searchQuery, setSearchQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);

  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching location:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout for search
    searchTimeout.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    const location = {
      address: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    };
    onLocationSelect(location);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="location-search" onClick={(e) => e.stopPropagation()}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="location-search-input"
      />
      {isSearching && <div className="search-spinner">Searching...</div>}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Map bounds adjuster component
function MapBoundsAdjuster({ pickupLocation, dropLocation }) {
  const map = useMap();

  useEffect(() => {
    if (pickupLocation && dropLocation) {
      const bounds = L.latLngBounds([
        [pickupLocation.lat, pickupLocation.lng],
        [dropLocation.lat, dropLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupLocation) {
      map.setView([pickupLocation.lat, pickupLocation.lng], 14);
    } else if (dropLocation) {
      map.setView([dropLocation.lat, dropLocation.lng], 14);
    }
  }, [map, pickupLocation, dropLocation]);

  return null;
}

// Main map component
const LeafletMap = ({ 
  pickupLocation, 
  dropLocation, 
  onPickupSelect, 
  onDropSelect,
  showRoute = false,
  height = '500px'
}) => {
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default Delhi
  const [selectingType, setSelectingType] = useState('pickup');
  const [routeInfo, setRouteInfo] = useState(null);
  const [isSelecting, setIsSelecting] = useState(true);
  const mapRef = useRef(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleMapClick = async (latlng) => {
    const location = {
      lat: latlng.lat,
      lng: latlng.lng
    };

    try {
      // Reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
      );
      const data = await response.json();

      const locationData = {
        address: data.display_name || 'Unknown location',
        lat: location.lat,
        lng: location.lng
      };

      if (selectingType === 'pickup') {
        onPickupSelect(locationData);
        setSelectingType('drop');
      } else {
        onDropSelect(locationData);
        setSelectingType('pickup');
      }
    } catch (error) {
      console.error('Error getting address:', error);
      // Still set the location even if geocoding fails
      const locationData = {
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        lat: location.lat,
        lng: location.lng
      };

      if (selectingType === 'pickup') {
        onPickupSelect(locationData);
        setSelectingType('drop');
      } else {
        onDropSelect(locationData);
      }
    }
  };

  const clearLocation = (type) => {
    if (type === 'pickup') {
      onPickupSelect(null);
      setSelectingType('pickup');
    } else {
      onDropSelect(null);
      if (!pickupLocation) {
        setSelectingType('pickup');
      }
    }
    setRouteInfo(null);
  };

  const handleRouteFound = (info) => {
    setRouteInfo(info);
  };

  const handleSearchSelect = (location, type) => {
    if (type === 'pickup') {
      onPickupSelect(location);
      if (!dropLocation) {
        setSelectingType('drop');
      }
    } else {
      onDropSelect(location);
      if (!pickupLocation) {
        setSelectingType('pickup');
      }
    }
  };

  return (
    <div className="leaflet-map-container">
      <div className="location-inputs">
        <div className="location-input-group">
          <label>Pickup Location</label>
          <div className="input-wrapper">
            <LocationSearch
              placeholder="Search pickup location or click on map"
              value={pickupLocation?.address}
              onLocationSelect={(location) => handleSearchSelect(location, 'pickup')}
            />
            {pickupLocation && (
              <button 
                className="clear-location-btn" 
                onClick={() => clearLocation('pickup')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="location-input-group">
          <label>Drop Location</label>
          <div className="input-wrapper">
            <LocationSearch
              placeholder="Search drop location or click on map"
              value={dropLocation?.address}
              onLocationSelect={(location) => handleSearchSelect(location, 'drop')}
            />
            {dropLocation && (
              <button 
                className="clear-location-btn" 
                onClick={() => clearLocation('drop')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="map-instructions">
        {!pickupLocation ? (
          <p>📍 Click on the map or search to select pickup location</p>
        ) : !dropLocation ? (
          <p>📍 Click on the map or search to select drop location</p>
        ) : (
          <p>✅ Route calculated. You can change locations by clicking on the map.</p>
        )}
      </div>

      <div style={{ height: height, width: '100%' }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onMapClick={handleMapClick} isSelecting={isSelecting} />
          <MapBoundsAdjuster pickupLocation={pickupLocation} dropLocation={dropLocation} />

          {pickupLocation && (
            <Marker 
              position={[pickupLocation.lat, pickupLocation.lng]} 
              icon={pickupIcon}
            >
              <Popup>
                <strong>Pickup Location</strong><br />
                {pickupLocation.address}
              </Popup>
            </Marker>
          )}

          {dropLocation && (
            <Marker 
              position={[dropLocation.lat, dropLocation.lng]} 
              icon={dropIcon}
            >
              <Popup>
                <strong>Drop Location</strong><br />
                {dropLocation.address}
              </Popup>
            </Marker>
          )}

          {showRoute && pickupLocation && dropLocation && (
            <RouteDisplay
              pickupLocation={pickupLocation}
              dropLocation={dropLocation}
              onRouteFound={handleRouteFound}
            />
          )}
        </MapContainer>
      </div>

      {routeInfo && (
        <div className="route-info">
          <div className="route-detail">
            <span className="label">Distance:</span>
            <span className="value">{routeInfo.distance}</span>
          </div>
          <div className="route-detail">
            <span className="label">Duration:</span>
            <span className="value">{routeInfo.duration}</span>
          </div>
        </div>
      )}

      <div className="map-toggle">
        <label>
          <input
            type="checkbox"
            checked={isSelecting}
            onChange={(e) => setIsSelecting(e.target.checked)}
          />
          Enable map click to select locations
        </label>
      </div>
    </div>
  );
};

export default LeafletMap;
