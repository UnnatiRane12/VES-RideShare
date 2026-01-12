
'use client';

import Link from "next/link";
import { ArrowRight, Car, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, Timestamp } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";

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
};

interface RoomCardProps {
  room: Room;
}

function RoomOwner({ ownerId }: { ownerId: string }) {
  const firestore = useFirestore();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !ownerId) return null;
    return doc(firestore, 'users', ownerId);
  }, [firestore, ownerId]);

  const { data: owner, isLoading } = useDoc<UserProfile>(userDocRef);

  if (isLoading) {
    return <Skeleton className="h-6 w-24" />;
  }

  if (!owner) {
    return null;
  }

  const name = `${owner.firstName} ${owner.lastName}`.trim();
  const fallback = name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        {/* We don't have avatarUrl in Firestore user profile yet */}
        {/* <AvatarImage src={owner.avatarUrl} alt={name} /> */}
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-foreground">{name}</span>
    </div>
  );
}

export function RoomCard({ room }: RoomCardProps) {
  const totalParticipants = room.participantIds.length + 1; // +1 for the owner

  return (
    <Card className="flex flex-col transition-shadow duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate">{room.roomName}</span>
          {room.autoStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                    <Car className="mr-1 h-4 w-4 text-accent" /> Auto Ready
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>The owner has already found an auto.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground"/> 
            <span>{room.startPoint} to {room.destination}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{`${totalParticipants} / ${room.passengerLimit} People`}</span>
          </div>
          <RoomOwner ownerId={room.ownerId} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/dashboard/rooms/${room.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
