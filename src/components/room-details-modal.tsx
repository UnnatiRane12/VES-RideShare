
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, MapPin, Users, User, LogIn, LogOut } from 'lucide-react';
import type { Room } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { GoogleMapComponent } from '@/components/google-map';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';


function RiderAvatar({ userId, avatarUrl }: { userId: string, avatarUrl?: string | null }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile } = useDoc(userDocRef);

  const name = userProfile?.firstName || 'User';
  const finalAvatarUrl = avatarUrl || (userProfile as any)?.photoURL;
  const fallback = name[0]?.toUpperCase();

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <Avatar>
                    <AvatarImage src={finalAvatarUrl} alt={name} />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
            </TooltipTrigger>
            <TooltipContent>
                <p>{name}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}

interface RoomDetailsModalProps {
    room: Room;
    onClose: () => void;
}

export function RoomDetailsModal({ room: initialRoom, onClose }: RoomDetailsModalProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const roomDocRef = useMemoFirebase(() => {
    if (!firestore || !initialRoom.id) return null;
    return doc(firestore, 'sharingRooms', initialRoom.id);
  }, [firestore, initialRoom.id]);
  
  const { data: room } = useDoc<Room>(roomDocRef, {
      initialData: initialRoom
  });

  if (!room) {
    // This can happen briefly or if the room is deleted.
    // The modal will close due to the open/onOpenChange logic below.
    return null; 
  }


  const handleJoinLeaveRoom = async () => {
    if (!user || !room || !roomDocRef) return;

    const isParticipant = room.participantIds.includes(user.uid);
    const operation = isParticipant ? arrayRemove : arrayUnion;
    const feedbackVerb = isParticipant ? 'Left' : 'Joined';
    
    try {
      await updateDoc(roomDocRef, {
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

  const isUserParticipant = user ? room.participantIds.includes(user.uid) : false;
  const isRoomFull = room.participantIds.length >= room.passengerLimit;

  return (
     <Dialog open={!!room} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-4xl p-0">
            <Card className="border-none shadow-none">
                 <DialogHeader className="p-6 pb-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <DialogTitle asChild>
                                <CardTitle className="text-3xl font-bold tracking-tight mb-2">{room.name}</CardTitle>
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-5 w-5" />
                                    <span className="font-medium">{room.startingPoint} to {room.destination}</span>
                                </div>
                            </DialogDescription>
                        </div>
                        {room.autoStatus && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 shrink-0 text-base px-4 py-2">
                                <Car className="mr-2 h-5 w-5" /> Auto Secured
                            </Badge>
                        )}
                    </div>
                </DialogHeader>
                <CardContent className="p-6 pt-4 space-y-8">
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
                                <RiderAvatar key={riderId} userId={riderId} avatarUrl={riderId === room.ownerId ? room.ownerAvatarUrl : null} />
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
        </DialogContent>
     </Dialog>
  );
}
