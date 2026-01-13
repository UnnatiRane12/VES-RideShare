
'use client';

import { RoomCard } from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, Search, Sparkles } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { FormEvent, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Room } from "@/lib/data";
import { smartRouteSuggestions, SmartRouteSuggestionsOutput } from "@/ai/flows/smart-route-suggestions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FindRoomPage() {
  const firestore = useFirestore();
  const [search, setSearch] = useState({ startPoint: '', destination: '' });
  const [submittedSearch, setSubmittedSearch] = useState({ startPoint: '', destination: '' });
  const [suggestions, setSuggestions] = useState<SmartRouteSuggestionsOutput | null>(null);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);

  const roomsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    let q = query(collection(firestore, 'sharingRooms'));

    if (submittedSearch.startPoint) {
      q = query(q, where('startingPoint', '>=', submittedSearch.startPoint), where('startingPoint', '<=', submittedSearch.startPoint + '\uf8ff'));
    }
    if (submittedSearch.destination) {
      q = query(q, where('destination', '>=', submittedSearch.destination), where('destination', '<=', submittedSearch.destination + '\uf8ff'));
    }

    return q;
  }, [firestore, submittedSearch]);

  const { data: allRooms, isLoading } = useCollection<Room>(roomsQuery);

  const availableRooms = allRooms?.filter(room => room.participantIds.length < room.passengerLimit);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedSearch(search);
    if(search.startPoint && search.destination) {
      setIsAISuggestionLoading(true);
      setSuggestions(null);
      try {
        const result = await smartRouteSuggestions({
            startPoint: search.startPoint,
            destination: search.destination,
            autoStatus: false, // You can adjust this if you have this info
        });
        setSuggestions(result);
      } catch (error) {
        console.error("AI suggestion error:", error);
      } finally {
        setIsAISuggestionLoading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                <Search className="h-6 w-6" />
                Find a Ride
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSearch}>
                <div className="grid gap-2">
                    <Label htmlFor="start-point">Starting Point</Label>
                    <Input 
                    id="start-point" 
                    placeholder="e.g., Chembur Station" 
                    value={search.startPoint} 
                    onChange={(e) => setSearch(prev => ({ ...prev, startPoint: e.target.value }))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input 
                    id="destination" 
                    placeholder="e.g., VESIT" 
                    value={search.destination}
                    onChange={(e) => setSearch(prev => ({ ...prev, destination: e.target.value }))}
                    />
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-teal-400 text-primary-foreground">
                    Search
                </Button>
                </form>
            </CardContent>
          </Card>
           {isAISuggestionLoading && (
            <div className="p-4 space-y-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse"/>
                    <h3 className="font-semibold">Generating Smart Suggestions...</h3>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
           )}
           {suggestions && (
              <Alert>
                  <Sparkles className="h-5 w-5 text-primary" />
                  <AlertTitle>Smart Suggestions</AlertTitle>
                  <AlertDescription>
                    {suggestions.suggestedRoutes.length > 0 && (
                        <div className="mt-2">
                            <h4 className="font-semibold text-foreground">Suggested Routes:</h4>
                            <ul className="list-disc list-inside text-xs">
                                {suggestions.suggestedRoutes.map((route, i) => <li key={i}>{route}</li>)}
                            </ul>
                        </div>
                    )}
                    {suggestions.nearbyDestinations.length > 0 && (
                        <div className="mt-2">
                            <h4 className="font-semibold text-foreground">Nearby Destinations:</h4>
                            <ul className="list-disc list-inside text-xs">
                                {suggestions.nearbyDestinations.map((dest, i) => <li key={i}>{dest}</li>)}
                            </ul>
                        </div>
                    )}
                  </AlertDescription>
              </Alert>
           )}
        </div>
      </div>
      <div className="lg:col-span-3">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Available Rooms</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
          </div>
        ) : availableRooms && availableRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {availableRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px] bg-card/50">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Rooms Found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              There are no available rooms matching your search. Why not be the first to create one?
            </p>
             <Button asChild className="mt-4">
                <a href="/dashboard/create">Create a Ride</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
