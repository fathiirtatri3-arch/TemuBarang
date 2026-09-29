import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useCallback, useState } from 'react';

// Koordinat pusat Kecamatan Sambikerep
const center = {
  lat: -7.2745,
  lng: 112.6585,
};

// Batas area Kecamatan Sambikerep (perkiraan)
const sambikerepBounds = {
  north: -7.2500,
  south: -7.3000,
  east: 112.6800,
  west: 112.6300,
};

export default function PetaSambikerep({ onLocationSelect, initialMarker }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(initialMarker || null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const newPosition = { lat, lng };
    setMarkerPosition(newPosition);
    
    if (onLocationSelect) {
      onLocationSelect(newPosition);
    }
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '12px' }}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={handleMapClick}
      options={{
        restriction: {
          latLngBounds: sambikerepBounds,
          strictBounds: true,
        },
      }}
    >
      {markerPosition && <Marker position={markerPosition} />}
    </GoogleMap>
  );
}