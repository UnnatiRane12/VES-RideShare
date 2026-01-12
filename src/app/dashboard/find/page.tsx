
'use client';

import { RoomCard } from "@/components/room-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb, Search, Sparkles } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Timestamp } from "firebase/firestore";

type Room = {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  participantIds: string[];
  startingPoint: string;
  destination: string;
  passengerLimit: number;
  autoStatus: boolean;
};

export default function FindRoomPage() {
  const firestore = useFirestore();
  const [search, setSearch] = useState({ startPoint: '', destination: '' });
  const [submittedSearch, setSubmittedSearch] = useState({ startPoint: '', destination: '' });

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedSearch(search);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card className="shadow-lg sticky top-20">
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
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-violet-500 text-white">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Alert className="mt-6 bg-primary/5 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary">Smart Suggestions</AlertTitle>
          <AlertDescription>
            Can't find a ride? Our AI can help you find rides to nearby destinations or suggest common routes. Try searching to see suggestions!
          </AlertDescription>
        </Alert>

      </div>
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Available Rooms</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
          </div>
        ) : availableRooms && availableRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availableRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px] bg-gray-50">
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

    