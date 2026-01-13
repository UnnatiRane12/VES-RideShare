
"use client";

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";

interface MapProps {
  origin: string;
  destination: string;
}

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

const center = {
  lat: 19.0760, // Mumbai coordinates
  lng: 72.8777,
};

export function GoogleMapComponent({ origin, destination }: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [originGeocoded, setOriginGeocoded] = useState<google.maps.LatLngLiteral | null>(null);
  const [destinationGeocoded, setDestinationGeocoded] = useState<google.maps.LatLngLiteral | null>(null);


  useEffect(() => {
    if (isLoaded && (origin || destination)) {
      const geocoder = new window.google.maps.Geocoder();
      
      if (origin) {
        geocoder.geocode({ address: origin }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                setOriginGeocoded(results[0].geometry.location.toJSON());
            } else {
              console.error(`Geocode was not successful for the following reason: ${status}`);
            }
        });
      }
      
      if (destination) {
        geocoder.geocode({ address: destination }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                setDestinationGeocoded(results[0].geometry.location.toJSON());
            } else {
              console.error(`Geocode was not successful for the following reason: ${status}`);
            }
        });
      }
    }
  }, [isLoaded, origin, destination]);
  
  if (!isClient) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (loadError) {
    return (
       <Card className="bg-destructive/10 border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive-foreground">Map Error: Could not load Google Maps. Please check the console for more details.</p>
        </CardContent>
       </Card>
    )
  }
  
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
     return (
       <Card className="bg-yellow-500/10 border-yellow-500">
        <CardContent className="p-6">
          <p className="text-yellow-200">
            <strong>API Key Missing:</strong> Please add your Google Maps API key to the `.env` file as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to display the map. You may need to restart the development server after adding the key.
          </p>
        </CardContent>
       </Card>
    )
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={originGeocoded || destinationGeocoded || center}
      zoom={12}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        styles: [ // Dark mode styles
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
             {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
        ],
      }}
    >
      {originGeocoded && <Marker position={originGeocoded} title="Starting Point" />}
      {destinationGeocoded && <Marker position={destinationGeocoded} title="Destination" />}
    </GoogleMap>
  ) : (
    <Skeleton className="h-[400px] w-full" />
  );
}
