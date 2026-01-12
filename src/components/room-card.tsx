
'use client';

import Link from "next/link";
import { ArrowRight, Car, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Timestamp } from "firebase/firestore";

type Room = {
  id: string;
  roomName: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  participantIds: string[];
  startPoint: string;
  destination: string;
  passengerLimit: number;
  autoStatus: boolean;
  expirationTime: Timestamp;
};

interface RoomCardProps {
  room: Room;
}

function RoomOwner({ ownerName, ownerAvatarUrl }: { ownerName: string; ownerAvatarUrl?: string }) {
  const fallback = ownerName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
         <AvatarImage src={ownerAvatarUrl} alt={ownerName} />
        <AvatarFallback>{fallback}</AvatarFallback>
      </Avatar>
      <span className="font-medium text-foreground">{ownerName}</span>
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
          <RoomOwner ownerName={room.ownerName} ownerAvatarUrl={room.ownerAvatarUrl} />
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
