
'use client';
import { useState, useEffect, useMemo } from 'react';
import { GoogleMap as GoogleMapApi, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from './ui/skeleton';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 19.0760, // Default to Mumbai
  lng: 72.8777
};

interface GoogleMapProps {
  startPoint: string;
  destination: string;
}

export function GoogleMap({ startPoint, destination }: GoogleMapProps) {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const directionsServiceOptions = useMemo(() => {
    return {
      destination,
      origin: startPoint,
      travelMode: 'DRIVING' as google.maps.TravelMode,
    };
  }, [startPoint, destination]);

  const directionsCallback = (
    response: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === 'OK' && response) {
      setDirections(response);
    } else {
      console.error(`Directions request failed due to ${status}`);
      setError(`Directions request failed. Please check the locations.`);
    }
  };
  
  if (!isClient) {
    return <Skeleton className="w-full h-full" />;
  }

  if (!googleMapsApiKey) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground text-center p-4">
        Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file and restart the server.
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMapApi
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
      >
        {startPoint && destination && (
          <DirectionsService
            options={directionsServiceOptions}
            callback={directionsCallback}
          />
        )}

        {directions && (
          <DirectionsRenderer
            options={{
              directions: directions,
            }}
          />
        )}

        {error && <div style={{ color: 'red' }}>{error}</div>}
      </GoogleMapApi>
    </LoadScript>
  );
}
