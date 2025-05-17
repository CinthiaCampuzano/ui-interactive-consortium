import React, { useState, useCallback, useRef, useEffect } from 'react';
import {GoogleMap, LoadScript, Marker, useJsApiLoader} from '@react-google-maps/api';

const MapComponent = ({ provincia, departamento, direccion }) => {
  const [map, setMap] = useState(null);
  const [position, setPosition] = useState(null);

  const mapRef = useRef();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: ['geometry', 'drawing'],
  });

  const updateMapPosition = useCallback(() => {
    if (mapRef.current) {
      const address = direccion ? `${direccion}, ${departamento}, ${provincia}, Argentina` : 'Buenos Aires, Argentina';
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          setPosition(location);
          mapRef.current.setCenter(location); // Center the map on the location
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
        }
      });
    }
  }, [direccion, departamento, provincia]);


  useEffect(() => {
    updateMapPosition();
  }, [direccion, departamento, provincia, updateMapPosition]);

  const onLoad = useCallback(googleMap => {
    setMap(googleMap);
    mapRef.current = googleMap;
    updateMapPosition();
  }, [updateMapPosition]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '250px', // Adjust the height as needed
  };

  const options = {
    disableDefaultUI: true, // Optional: to hide default map controls
    zoomControl: false, // Optional: to hide zoom controls
    gestureHandling: 'none', // Disable zoom with mouse wheel
  };

  return (
      <div>
      {isLoaded && <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={15} // Adjust initial zoom level as needed
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={options}
        >
          {position && <Marker position={position} />}
        </GoogleMap>
      }
      </div>
  );
};

export default MapComponent;