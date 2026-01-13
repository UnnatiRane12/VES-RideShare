
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { RoomCard } from "@/components/room-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/data";


export default function MyRidesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myRidesQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    
    // This query finds all rooms where the current user is a participant.
    // This includes rooms they've created (as owner) and rooms they've joined.
    return query(collection(firestore, 'sharingRooms'), where('participantIds', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: myRides, isLoading } = useCollection<Room>(myRidesQuery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Rides</CardTitle>
        <CardDescription>A list of all your past and upcoming rides, both created and joined.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || isUserLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
            <Skeleton className="h-52 rounded-lg" />
          </div>
        ) : myRides && myRides.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {myRides.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[400px] bg-gray-50/50">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Rides Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              You haven't joined or created any rides. Find one to get started!
            </p>
             <Button asChild className="mt-4">
                <a href="/dashboard/find">Find a Ride</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
