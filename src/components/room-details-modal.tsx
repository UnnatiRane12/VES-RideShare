
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Car, MapPin, Users, LogIn, LogOut, Flag } from 'lucide-react';
import type { Room } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';

const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full" />,
  }
);


function RiderAvatar({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: userProfile, isLoading } = useDoc(userDocRef);

  if (isLoading) {
    return (
       <div className="flex flex-col items-center justify-center gap-2 text-center">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    )
  }

  const fullName = userProfile ? `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() : 'VES Rider';
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
    isOpen: boolean;
    onClose: () => void;
}

export function RoomDetailsModal({ room: initialRoom, isOpen, onClose }: RoomDetailsModalProps) {
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
     <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}>
        <DialogContent className="max-w-lg p-0">
            <DialogHeader className="p-6 pb-4 space-y-2">
                <DialogTitle className="text-2xl font-bold">{room.name}</DialogTitle>
                <DialogDescription>
                    A ride from <span className="font-semibold text-primary">{room.startingPoint}</span> to <span className="font-semibold text-primary">{room.destination}</span>.
                </DialogDescription>
            </DialogHeader>
            
            <CardContent className="p-6 pt-0 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <span className="text-muted-foreground">From</span>
                                <p className="font-medium text-foreground">{room.startingPoint}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                            <Flag className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <span className="text-muted-foreground">To</span>
                                <p className="font-medium text-foreground">{room.destination}</p>
                            </div>
                        </div>
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                            <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <span className="text-muted-foreground">Capacity</span>
                                <p className="font-medium text-foreground">{room.participantIds.length} / {room.passengerLimit} Riders</p>
                            </div>
                        </div>
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-card/50">
                            <Car className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                                <span className="text-muted-foreground">Ride Status</span>
                                <p className="font-medium text-foreground">{room.autoStatus ? 'Auto/Cab is Ready' : 'Searching for Auto/Cab'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Separator />

                 <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Map</h3>
                    <div className="rounded-lg overflow-hidden border">
                       {isOpen && <LeafletMap origin={room.startingPoint} destination={room.destination} />}
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                       Riders
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
                  <Button className="w-full text-lg py-6 bg-gradient-to-r from-primary to-teal-400 text-primary-foreground hover:scale-105 transition-transform" onClick={handleJoinLeaveRoom} disabled={!user || (isRoomFull && !isUserParticipant)}>
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
