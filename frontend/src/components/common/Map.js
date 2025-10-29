import React, { useState } from 'react';
import './Map.css';

// Predefined locations for demo
const DEMO_LOCATIONS = {
  chennai: {
    areas: [
      { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
      { name: 'Adyar', lat: 13.0067, lng: 80.2572 },
      { name: 'Velachery', lat: 12.9830, lng: 80.2180 },
      { name: 'Anna Nagar', lat: 13.0850, lng: 80.2101 },
      { name: 'Mylapore', lat: 13.0338, lng: 80.2697 },
      { name: 'Tambaram', lat: 12.9249, lng: 80.1000 },
      { name: 'Egmore', lat: 13.0732, lng: 80.2609 },
      { name: 'Guindy', lat: 13.0067, lng: 80.2206 }
    ]
  }
};

const Map = ({ 
  pickupLocation, 
  dropLocation, 
  onPickupSelect, 
  onDropSelect,
  showRoute = false,
  height = '400px'
}) => {
  const [selectedCity] = useState('chennai');
  const [selectingType, setSelectingType] = useState('pickup');

  const handleLocationSelect = (location) => {
    const locationData = {
      address: `${location.name}, Chennai`,
      lat: location.lat,
      lng: location.lng
    };

    if (selectingType === 'pickup') {
      onPickupSelect(locationData);
      setSelectingType('drop');
    } else {
      onDropSelect(locationData);
    }
  };

  const resetSelection = (type) => {
    if (type === 'pickup') {
      onPickupSelect(null);
      setSelectingType('pickup');
    } else {
      onDropSelect(null);
      setSelectingType('drop');
    }
  };

  return (
    <div className="map-container">
      <div className="map-instructions">
        {!pickupLocation ? (
          <p>Select your pickup location from the list below</p>
        ) : !dropLocation ? (
          <p>Now select your drop location</p>
        ) : (
          <p>Great! Your locations are selected.</p>
        )}
      </div>

      <div className="location-selector" style={{ height }}>
        <h3>Available Locations in {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}</h3>
        
        <div className="locations-grid">
          {DEMO_LOCATIONS[selectedCity].areas.map((location, index) => (
            <button
              key={index}
              className={`location-button ${
                pickupLocation?.address.includes(location.name) ? 'selected pickup' : 
                dropLocation?.address.includes(location.name) ? 'selected drop' : ''
              }`}
              onClick={() => handleLocationSelect(location)}
              disabled={
                (pickupLocation?.address.includes(location.name)) ||
                (dropLocation?.address.includes(location.name))
              }
            >
              {location.name}
              {pickupLocation?.address.includes(location.name) && ' (Pickup)'}
              {dropLocation?.address.includes(location.name) && ' (Drop)'}
            </button>
          ))}
        </div>
      </div>

      <div className="location-summary">
        {pickupLocation && (
          <div className="location-item">
            <strong>📍 Pickup:</strong> {pickupLocation.address}
            <button 
              className="clear-btn" 
              onClick={() => resetSelection('pickup')}
            >
              Change
            </button>
          </div>
        )}
        {dropLocation && (
          <div className="location-item">
            <strong>📍 Drop:</strong> {dropLocation.address}
            <button 
              className="clear-btn" 
              onClick={() => resetSelection('drop')}
            >
              Change
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
