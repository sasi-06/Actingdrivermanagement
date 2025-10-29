// Mini map component for displaying booking locations
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MiniMap.css';

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -34],
  shadowSize: [32, 32]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -34],
  shadowSize: [32, 32]
});

const MiniMap = ({ pickupLocation, dropLocation, height = '200px', interactive = false }) => {
  // Calculate center and bounds
  const bounds = L.latLngBounds([
    [pickupLocation.lat, pickupLocation.lng],
    [dropLocation.lat, dropLocation.lng]
  ]);
  
  const center = bounds.getCenter();

  // Create a simple line between pickup and drop
  const routeLine = [
    [pickupLocation.lat, pickupLocation.lng],
    [dropLocation.lat, dropLocation.lng]
  ];

  return (
    <div className="mini-map-container" style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        bounds={bounds}
        boundsOptions={{ padding: [30, 30] }}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        scrollWheelZoom={false}
        boxZoom={interactive}
        keyboard={interactive}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon} />
        <Marker position={[dropLocation.lat, dropLocation.lng]} icon={dropIcon} />
        
        <Polyline
          positions={routeLine}
          color="#4285F4"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      </MapContainer>
      
      <div className="mini-map-legend">
        <span className="legend-item pickup">📍 Pickup</span>
        <span className="legend-item drop">📍 Drop</span>
      </div>
    </div>
  );
};

export default MiniMap;