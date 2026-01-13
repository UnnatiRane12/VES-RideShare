
'use client';

import Link from "next/link";
import { ArrowLeft, Car, Clock, Edit, MapPin, Users, CheckCircle, User, Award, Shield, UserPlus, Mail, School } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { GoogleMap } from "@/components/google-map";
import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Room } from "@/lib/data";

type UserProfile = {
  firstName: string;
  lastName: string;
  college: string;
  email: string;
  avatarUrl?: string; 
};

function RiderAvatar({ userId, isOwner }: { userId: string, isOwner: boolean }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);
    
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);

    if(isLoading || !userProfile) return (
      <div className="flex flex-col items-center gap-1 w-16 text-center">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    );

    const name = `${userProfile.firstName} ${userProfile.lastName}`.trim();
    const fallback = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-1 w-16 text-center relative cursor-pointer">
              <Avatar className="h-12 w-12 border-2 border-background ring-2 ring-primary">
                  {userProfile.avatarUrl ? 
                    <AvatarImage src={userProfile.avatarUrl} alt={name} /> :
                    <AvatarImage src={user?.photoURL || undefined} alt={name} />
                  }
                  <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold truncate w-full">{userProfile.firstName}</span>
              {isOwner && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Award className="h-3 w-3" />
                  </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-2 p-1">
              <p className="font-bold text-base">{name}</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{userProfile.email}</span>
              </div>
              {userProfile.college && (
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{userProfile.college}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
}


export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { id } = params;
  
  const roomDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'sharingRooms', id);
  }, [firestore, id]);

  const { data: room, isLoading, error } = useDoc<Room>(roomDocRef);

  if (isLoading) {
    return (
        <div className="w-full max-w-6xl mx-auto">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-96 w-full rounded-xl" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-[500px] w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
  }
  
  if (error || !room) {
    notFound();
    return null;
  }
  
  const participants = room.participantIds || [];
  const currentCapacity = participants.length;
  const isFull = currentCapacity >= room.passengerLimit;
  
  const isUserInRoom = user && participants.includes(user.uid);
  const isOwner = user && user.uid === room.ownerId;

  const handleJoinLeave = async () => {
      if (!user || !roomDocRef) return;
      
      const operation = isUserInRoom ? arrayRemove(user.uid) : arrayUnion(user.uid);
      
      try {
          await updateDoc(roomDocRef, { participantIds: operation });
          toast({
              title: isUserInRoom ? "Left the Room" : "Joined the Room!",
              description: isUserInRoom ? "You have successfully left the ride." : "You're in! Coordinate with fellow riders.",
          });
      } catch (e) {
          console.error("Error updating participants:", e);
          toast({
              variant: 'destructive',
              title: "Something went wrong",
              description: "Could not update your participation. Please try again."
          });
      }
  };

  const buttonText = () => {
    if (isFull && !isUserInRoom) return <><CheckCircle className="mr-2 h-4 w-4" /> Ride is Full</>;
    if (isUserInRoom) return "Leave Ride";
    return <><UserPlus className="mr-2 h-4 w-4" /> Join Ride</>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
       <Link href="/dashboard/find" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Find a Ride
      </Link>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <Card className="overflow-hidden shadow-xl">
                <div className="relative h-64 w-full md:h-96">
                   <GoogleMap startPoint={room.startingPoint} destination={room.destination} />
                </div>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>About this Ride</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                    <p>This ride was created by {room.ownerName} to share a commute from {room.startingPoint} to {room.destination}. Join in to save money, meet new people, and help the environment!</p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card className="shadow-lg">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold">{room.name}</CardTitle>
                    {isOwner && (
                        <Button variant="outline" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Room</span>
                        </Button>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-2 pt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{room.startingPoint} to {room.destination}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 grid gap-4">
                    <Separator/>
                     <div>
                        <div className="flex justify-between items-center mb-2 text-sm font-medium">
                            <span className="flex items-center gap-2"><Users className="h-5 w-5" /> Riders</span>
                            <span className="font-bold text-lg">{currentCapacity} / {room.passengerLimit}</span>
                        </div>
                        <Progress value={(currentCapacity / room.passengerLimit) * 100} className="h-3" />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-2">
                           <Car className="h-5 w-5 text-primary"/>
                           <span className="font-medium">Vehicle Status</span>
                        </div>
                        <Badge variant={room.autoStatus ? "default" : "secondary"} className={room.autoStatus ? "bg-green-500/20 text-green-700 dark:bg-green-900/50 dark:text-green-300" : ""}>
                           {room.autoStatus ? "Secured" : "Not Secured"}
                        </Badge>
                    </div>

                    <Separator/>
                    <div>
                        <h3 className="text-md font-semibold mb-3">Who's In?</h3>
                        <div className="flex flex-wrap gap-4">
                            {participants.map((riderId) => (
                                <RiderAvatar key={riderId} userId={riderId} isOwner={riderId === room.ownerId} />
                            ))}
                        </div>
                    </div>
                     <Separator/>
                     <div className="flex flex-col items-center gap-2">
                         <Button className="w-full bg-gradient-to-r from-primary to-teal-400 text-primary-foreground" disabled={(isFull && !isUserInRoom) || isOwner} onClick={handleJoinLeave}>
                            {buttonText()}
                        </Button>
                        {isOwner && <p className="text-xs text-muted-foreground">You are the owner of this room.</p>}
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
