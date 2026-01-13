
'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, MapPin, Users, User, ArrowLeft, LogIn, LogOut } from 'lucide-react';
import type { Room } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { GoogleMapComponent } from '@/components/google-map';

function RiderAvatar({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile } = useDoc(userDocRef);

  const name = userProfile?.firstName || 'User';
  const fallback = name[0]?.toUpperCase();

  return (
    <Avatar>
      <AvatarImage src={userProfile?.avatarUrl} alt={name} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}

export default function RoomDetailsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  
  const roomDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'sharingRooms', id);
  }, [firestore, id]);
  
  const { data: room, isLoading } = useDoc<Room>(roomDocRef);

  const handleJoinLeaveRoom = async () => {
    if (!user || !room) return;

    const isParticipant = room.participantIds.includes(user.uid);
    const operation = isParticipant ? arrayRemove : arrayUnion;
    const feedbackVerb = isParticipant ? 'Left' : 'Joined';
    
    try {
      await updateDoc(roomDocRef!, {
        participantIds: operation(user.uid),
      });

      toast({
        title: `${feedbackVerb} Room`,
        description: `You have successfully ${feedbackVerb.toLowerCase()} the room "${room.name}".`,
      });
    } catch (error) {
      console.error(`Error ${feedbackVerb.toLowerCase()}ing room:`, error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: `There was a problem. Please try again.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-96 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          </CardContent>
          <CardFooter>
             <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!room) {
    notFound();
  }

  const isUserParticipant = user ? room.participantIds.includes(user.uid) : false;
  const isRoomFull = room.participantIds.length >= room.passengerLimit;
  const canJoin = user && !isUserParticipant && !isRoomFull;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" asChild>
        <Link href="/dashboard/find">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Find a Ride
        </Link>
      </Button>

      <Card className="overflow-hidden">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <CardTitle className="text-3xl font-bold tracking-tight mb-2">{room.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="font-medium">{room.startingPoint} to {room.destination}</span>
                </div>
            </div>
            {room.autoStatus && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 shrink-0 text-base px-4 py-2">
                    <Car className="mr-2 h-5 w-5" /> Auto Secured
                </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-8">

            <GoogleMapComponent origin={room.startingPoint} destination={room.destination} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <Card className="bg-card/50">
                    <CardHeader>
                       <CardTitle className="flex items-center justify-center gap-2"><User className="text-primary"/>Owner</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{room.ownerName}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/50">
                    <CardHeader>
                       <CardTitle className="flex items-center justify-center gap-2"><Users className="text-primary"/>Capacity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{`${room.participantIds.length} / ${room.passengerLimit} Riders`}</p>
                    </CardContent>
                </Card>
                 <Card className="bg-card/50">
                    <CardHeader>
                       <CardTitle className="flex items-center justify-center gap-2"><Car className="text-primary"/>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-semibold">{room.autoStatus ? 'Auto Ready' : 'Finding Auto'}</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-4">Riders</h3>
                <div className="flex space-x-4">
                    {room.participantIds.map(riderId => (
                        <RiderAvatar key={riderId} userId={riderId} />
                    ))}
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-6 bg-card/50">
          {user && (
            <Button className="w-full text-lg py-6" onClick={handleJoinLeaveRoom} disabled={!user || (isRoomFull && !isUserParticipant)}>
                {isUserParticipant ? <><LogOut className="mr-2"/>Leave Room</> : <><LogIn className="mr-2"/>Join Room</>}
            </Button>
          )}
          {!user && (
             <Button className="w-full text-lg py-6" disabled>
                Login to Join Room
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
