
"use client";

import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
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
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (isLoaded && origin && destination) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
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
      center={center}
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
      onLoad={(map) => {
        if (directions) {
          map.fitBounds(directions.routes[0].bounds);
        }
      }}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#10B981",
              strokeWeight: 5,
            },
          }}
        />
      )}
      {directions?.routes[0]?.legs[0]?.start_location && (
        <Marker
          position={directions.routes[0].legs[0].start_location}
          title="Starting Point"
        />
      )}
      {directions?.routes[0]?.legs[0]?.end_location && (
        <Marker
          position={directions.routes[0].legs[0].end_location}
          title="Destination"
        />
      )}
    </GoogleMap>
  ) : (
    <Skeleton className="h-[400px] w-full" />
  );
}
