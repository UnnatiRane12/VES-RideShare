
'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Car, Clock, Edit, MapPin, Users, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { notFound, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

type Room = {
  id: string;
  roomName: string;
  ownerId: string;
  participantIds: string[];
  startPoint: string;
  destination: string;
  passengerLimit: number;
  autoStatus: boolean;
  expirationTime: Timestamp;
};

type UserProfile = {
  firstName: string;
  lastName: string;
  // avatarUrl might not exist yet, so it's optional
  avatarUrl?: string; 
};

function RiderAvatar({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const userDocRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);
    
    const { data: userProfile, isLoading } = useDoc<UserProfile>(userDocRef);
    const placeholder = PlaceHolderImages.find(p => p.id === 'user-avatar-placeholder');

    if(isLoading) return <Skeleton className="h-12 w-12 rounded-full" />;

    if(!userProfile) return (
        <Avatar>
            {placeholder && <AvatarImage src={placeholder.imageUrl} alt="User" />}
            <AvatarFallback>U</AvatarFallback>
        </Avatar>
    );

    const name = `${userProfile.firstName} ${userProfile.lastName}`.trim();
    const fallback = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <div className="flex flex-col items-center gap-1 w-16 text-center">
            <Avatar>
                 {userProfile.avatarUrl ? 
                    <AvatarImage src={userProfile.avatarUrl} alt={name} /> :
                    placeholder && <AvatarImage src={placeholder.imageUrl} alt={name} />
                 }
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <span className="text-xs truncate w-full">{name}</span>
        </div>
    )
}


export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  
  const roomDocRef = useMemoFirebase(() => {
    if (!firestore || !params.id) return null;
    return doc(firestore, 'rideSharingRooms', params.id);
  }, [firestore, params.id]);

  const { data: room, isLoading, error } = useDoc<Room>(roomDocRef);

  if (isLoading) {
    return (
        <div className="w-full">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Skeleton className="h-64 w-full md:h-96 rounded-lg" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-96 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
  }
  
  if (!room) {
    // If the room is not found after loading, redirect
    notFound();
    return null;
  }
  
  const ownerId = room.ownerId;
  const participants = room.participantIds || [];
  const allRiderIds = [ownerId, ...participants];
  const currentCapacity = allRiderIds.length;
  const isFull = currentCapacity >= room.passengerLimit;
  const mapPlaceholder = PlaceHolderImages.find(img => img.id === 'map-placeholder');

  const timeRemaining = room.expirationTime.toMillis() - Date.now();
  const minutesRemaining = Math.max(0, Math.round(timeRemaining / 60000));
  
  const isUserInRoom = user && allRiderIds.includes(user.uid);
  const isOwner = user && user.uid === ownerId;

  const handleJoinLeave = async () => {
      if (!user || !roomDocRef) return;
      
      const operation = isUserInRoom ? arrayRemove(user.uid) : arrayUnion(user.uid);
      
      try {
          await updateDoc(roomDocRef, { participantIds: operation });
          toast({
              title: isUserInRoom ? "Left the Room" : "Joined the Room!",
              description: isUserInRoom ? "You have successfully left the ride." : "You're in! You can coordinate with other riders.",
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
    return "Join Ride";
  }

  return (
    <div className="w-full">
       <Link href="/dashboard/find" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </Link>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card className="overflow-hidden">
                {mapPlaceholder && (
                <div className="relative h-64 w-full md:h-96">
                    <Image
                    src={mapPlaceholder.imageUrl}
                    alt="Map placeholder"
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={mapPlaceholder.imageHint}
                    />
                </div>
                )}
            </Card>
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Card>
                <CardHeader>
                <CardTitle className="text-2xl">{room.roomName}</CardTitle>
                <div className="flex items-center justify-between text-muted-foreground text-sm pt-2">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{room.startPoint} to {room.destination}</span>
                    </div>
                     {room.autoStatus && <Badge variant="secondary" className="bg-accent/20 text-accent-foreground"><Car className="mr-1 h-3 w-3 text-accent" /> Auto Ready</Badge>}
                </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-sm font-medium">
                            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Capacity</span>
                            <span>{currentCapacity} / {room.passengerLimit}</span>
                        </div>
                        <Progress value={(currentCapacity / room.passengerLimit) * 100} />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm font-medium">
                            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Expires in</span>
                             <span>~{minutesRemaining} min</span>
                        </div>
                    </div>
                    <Separator/>
                    <div>
                        <h3 className="text-md font-semibold mb-2">Riders</h3>
                        <div className="flex flex-wrap gap-4">
                            {allRiderIds.map((riderId, index) => (
                                <div key={riderId} className="relative">
                                    <RiderAvatar userId={riderId} />
                                    {index === 0 && <Badge variant="outline" className="text-xs absolute -top-1 -right-2">Owner</Badge>}
                                </div>
                            ))}
                        </div>
                    </div>
                     <Separator/>
                     <div className="flex items-center gap-2">
                         <Button className="w-full" disabled={(isFull && !isUserInRoom) || isOwner} onClick={handleJoinLeave}>
                            {buttonText()}
                        </Button>
                        <Button variant="outline" size="icon" disabled={!isOwner}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Room</span>
                        </Button>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
