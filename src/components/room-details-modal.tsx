
'use client';

import React from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, MapPin, Users, LogIn, LogOut, Flag } from 'lucide-react';
import type { Room } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from './ui/separator';


function RiderAvatar({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile } = useDoc(userDocRef);

  const fullName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'Loading...';
  const college = userProfile?.college || 'VES Campus';
  const finalAvatarUrl = (userProfile as any)?.photoURL;
  const fallback = (userProfile?.firstName?.[0] || 'U').toUpperCase();

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-center">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
            <AvatarImage src={finalAvatarUrl} alt={fullName} />
            <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div className="text-sm">
            <p className="font-semibold">{fullName}</p>
            <p className="text-xs text-muted-foreground">{college}</p>
        </div>
    </div>
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
            <DialogHeader className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <DialogTitle>{room.name}</DialogTitle>
                         <DialogDescription className="mt-1">
                            A ride from {room.startingPoint} to {room.destination}.
                        </DialogDescription>
                    </div>
                    {room.autoStatus && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 shrink-0 text-sm px-3 py-1 mt-1">
                            <Car className="mr-2 h-4 w-4" /> Ready
                        </Badge>
                    )}
                </div>
            </DialogHeader>
            
            <CardContent className="p-6 pt-0 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-primary">Details</h3>
                    <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <span className="text-muted-foreground">From</span>
                                <p className="font-medium">{room.startingPoint}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Flag className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <span className="text-muted-foreground">To</span>
                                <p className="font-medium">{room.destination}</p>
                            </div>
                        </div>
                          <div className="flex items-start gap-3">
                            <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {room.participantIds.map(riderId => (
                            <RiderAvatar key={riderId} userId={riderId} />
                        ))}
                    </div>
                </div>
            </CardContent>
            
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
