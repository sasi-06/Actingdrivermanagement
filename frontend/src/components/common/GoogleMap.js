// Google Maps component with interactive location selection
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  Autocomplete,
} from "@react-google-maps/api";
import "./GoogleMap.css";

const libraries = ["places"];

const GoogleMapComponent = ({
  pickupLocation,
  dropLocation,
  onPickupSelect,
  onDropSelect,
  showRoute = false,
  height = "500px",
}) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [selectingType, setSelectingType] = useState("pickup");
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 }); // Default Delhi

  const pickupAutocompleteRef = useRef(null);
  const dropAutocompleteRef = useRef(null);

  const mapContainerStyle = {
    width: "100%",
    height: height,
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const onMapClick = useCallback(
    (event) => {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results[0]) {
          const locationData = {
            address: results[0].formatted_address,
            lat: location.lat,
            lng: location.lng,
            placeId: results[0].place_id,
          };

          if (selectingType === "pickup") {
            onPickupSelect(locationData);
            setSelectingType("drop");
          } else {
            onDropSelect(locationData);
          }

          if (
            (selectingType === "pickup" && dropLocation) ||
            (selectingType === "drop" && pickupLocation)
          ) {
            calculateRoute();
          }
        }
      });
    },
    [selectingType, onPickupSelect, onDropSelect, pickupLocation, dropLocation]
  );

  const calculateRoute = useCallback(() => {
    if (pickupLocation && dropLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService();

      directionsService.route(
        {
          origin: new window.google.maps.LatLng(
            pickupLocation.lat,
            pickupLocation.lng
          ),
          destination: new window.google.maps.LatLng(
            dropLocation.lat,
            dropLocation.lng
          ),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
            const route = result.routes[0].legs[0];
            setDistance(route.distance.text);
            setDuration(route.duration.text);
          }
        }
      );
    }
  }, [pickupLocation, dropLocation]);

  useEffect(() => {
    if (showRoute && pickupLocation && dropLocation) {
      calculateRoute();
    }
  }, [showRoute, pickupLocation, dropLocation, calculateRoute]);

  const onPickupPlaceChanged = () => {
    if (pickupAutocompleteRef.current) {
      const place = pickupAutocompleteRef.current.getPlace();
      if (place.geometry) {
        const locationData = {
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id,
        };
        onPickupSelect(locationData);
        setSelectingType("drop");

        if (dropLocation) {
          calculateRoute();
        }
      }
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocompleteRef.current) {
      const place = dropAutocompleteRef.current.getPlace();
      if (place.geometry) {
        const locationData = {
          address: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id,
        };
        onDropSelect(locationData);

        if (pickupLocation) {
          calculateRoute();
        }
      }
    }
  };

  const clearLocation = (type) => {
    if (type === "pickup") {
      onPickupSelect(null);
      setSelectingType("pickup");
    } else {
      onDropSelect(null);
    }
    setDirections(null);
    setDistance(null);
    setDuration(null);
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className="google-map-container">
        <div className="location-inputs">
          <div className="location-input-group">
            <label>Pickup Location</label>
            <div className="input-wrapper">
              <Autocomplete
                onLoad={(autocomplete) =>
                  (pickupAutocompleteRef.current = autocomplete)
                }
                onPlaceChanged={onPickupPlaceChanged}
              >
                <input
                  type="text"
                  placeholder="Enter pickup location or click on map"
                  defaultValue={pickupLocation?.address}
                  className="location-input"
                />
              </Autocomplete>
              {pickupLocation && (
                <button
                  className="clear-location-btn"
                  onClick={() => clearLocation("pickup")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="location-input-group">
            <label>Drop Location</label>
            <div className="input-wrapper">
              <Autocomplete
                onLoad={(autocomplete) =>
                  (dropAutocompleteRef.current = autocomplete)
                }
                onPlaceChanged={onDropPlaceChanged}
              >
                <input
                  type="text"
                  placeholder="Enter drop location or click on map"
                  defaultValue={dropLocation?.address}
                  className="location-input"
                />
              </Autocomplete>
              {dropLocation && (
                <button
                  className="clear-location-btn"
                  onClick={() => clearLocation("drop")}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="map-instructions">
          {!pickupLocation ? (
            <p>📍 Click on the map or use search to select pickup location</p>
          ) : !dropLocation ? (
            <p>📍 Click on the map or use search to select drop location</p>
          ) : (
            <p>✅ Route calculated. You can change locations by clicking on the map.</p>
          )}
        </div>

        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onClick={onMapClick}
          onLoad={setMap}
          options={options}
        >
          {pickupLocation && (
            <Marker
              position={{
                lat: pickupLocation.lat,
                lng: pickupLocation.lng,
              }}
              label={{ text: "P", color: "white" }}
              title="Pickup Location"
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
            />
          )}

          {dropLocation && (
            <Marker
              position={{
                lat: dropLocation.lat,
                lng: dropLocation.lng,
              }}
              label={{ text: "D", color: "white" }}
              title="Drop Location"
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              }}
            />
          )}

          {showRoute && directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#4285F4",
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>

        {distance && duration && (
          <div className="route-info">
            <div className="route-detail">
              <span className="label">Distance:</span>
              <span className="value">{distance}</span>
            </div>
            <div className="route-detail">
              <span className="label">Duration:</span>
              <span className="value">{duration}</span>
            </div>
          </div>
        )}
      </div>
    </LoadScript>
  );
};

export default GoogleMapComponent;
