
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression, LatLngTuple, Map } from 'leaflet';
import L from 'leaflet';
import { Skeleton } from './ui/skeleton';

// Fix for default icon not showing in Next.js
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/images/marker-icon-2x.png';

const icon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = icon;


interface GeocodingResult {
    lat: number;
    lon: number;
}

interface LeafletMapProps {
    origin: string;
    destination: string;
}

const fetchCoordinates = async (address: string): Promise<LatLngTuple | null> => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
        if (!response.ok) {
            throw new Error('Failed to fetch coordinates from Nominatim API');
        }
        const data: GeocodingResult[] = await response.json();
        if (data.length > 0) {
            return [data[0].lat, data[0].lon];
        }
        return null;
    } catch (error) {
        console.error(`Geocoding error for ${address}:`, error);
        return null;
    }
};

const MapBoundsUpdater = ({ bounds }: { bounds: L.LatLngBounds | null }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
};

export const LeafletMap: React.FC<LeafletMapProps> = ({ origin, destination }) => {
    const [originCoords, setOriginCoords] = useState<LatLngTuple | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<LatLngTuple | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

    useEffect(() => {
        const geocodeAddresses = async () => {
            setIsLoading(true);
            setError(null);
            
            // Add a small delay to respect Nominatim's usage policy (1 req/sec)
            const originPromise = fetchCoordinates(origin + ", Mumbai, India");
            await new Promise(resolve => setTimeout(resolve, 1100));
            const destPromise = fetchCoordinates(destination + ", Mumbai, India");

            const [originResult, destResult] = await Promise.all([originPromise, destPromise]);

            if (originResult && destResult) {
                setOriginCoords(originResult);
                setDestinationCoords(destResult);
                const newBounds = L.latLngBounds(originResult, destResult);
                setBounds(newBounds);
            } else {
                setError("Could not find coordinates for one or both locations.");
                console.error("Geocoding failed:", { origin, destResult });
            }
            setIsLoading(false);
        };
        geocodeAddresses();
    }, [origin, destination]);


    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (error) {
        return <div className="h-48 w-full flex items-center justify-center bg-muted text-destructive-foreground">{error}</div>;
    }

    if (!originCoords || !destinationCoords) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <MapContainer
            center={originCoords}
            zoom={13}
            style={{ height: '12rem', width: '100%' }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={originCoords}>
                <Popup>{origin}</Popup>
            </Marker>
            <Marker position={destinationCoords}>
                <Popup>{destination}</Popup>
            </Marker>
            <MapBoundsUpdater bounds={bounds} />
        </MapContainer>
    );
};
