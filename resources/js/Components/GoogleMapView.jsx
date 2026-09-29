import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const center = {
  lat: -7.2745,
  lng: 112.6585,
};

const sambikerepBounds = {
  north: -7.2500,
  south: -7.3000,
  east: 112.6800,
  west: 112.6300,
};

export default function PetaSambikerepView({ latitude, longitude, itemName }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  if (!latitude || !longitude) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-gray-300">location_off</span>
          <p className="text-sm text-gray-500 mt-2">Lokasi tidak tersedia</p>
        </div>
      </div>
    );
  }

  const markerPosition = {
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">Memuat peta...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '12px' }}
      center={markerPosition}
      zoom={16}
      options={{
        restriction: {
          latLngBounds: sambikerepBounds,
          strictBounds: true,
        },
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      <Marker position={markerPosition} title={itemName} />
    </GoogleMap>
  );
}