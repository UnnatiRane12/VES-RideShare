
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, MapPin, Users, LogIn, LogOut, Flag, Dot } from 'lucide-react';
import type { Room } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';


function RiderAvatar({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile } = useDoc(userDocRef);

  const name = userProfile?.firstName || 'User';
  const finalAvatarUrl = (userProfile as any)?.photoURL;
  const fallback = name[0]?.toUpperCase();

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger>
                <Avatar className="h-12 w-12 border-2 border-primary/30">
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
        <DialogContent className="max-w-lg p-0">
            <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <DialogTitle asChild>
                            <h2 className="text-3xl font-bold tracking-tight">{room.name}</h2>
                        </DialogTitle>
                    </div>
                    {room.autoStatus && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 shrink-0 text-sm px-3 py-1 mt-1">
                            <Car className="mr-2 h-4 w-4" /> Auto Secured
                        </Badge>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="text-muted-foreground">From</span>
                                    <p className="font-medium">{room.startingPoint}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Flag className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="text-muted-foreground">To</span>
                                    <p className="font-medium">{room.destination}</p>
                                </div>
                            </div>
                              <div className="flex items-center gap-3">
                                <Car className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="text-muted-foreground">Ride Status</span>
                                    <p className="font-medium">{room.autoStatus ? 'Auto/Cab is Ready' : 'Searching for Auto/Cab'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold mb-4">
                           Riders ({room.participantIds.length} / {room.passengerLimit})
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {room.participantIds.map(riderId => (
                                <RiderAvatar key={riderId} userId={riderId} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="p-6 bg-card/50 border-t">
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
            </div>
        </DialogContent>
     </Dialog>
  );
}
