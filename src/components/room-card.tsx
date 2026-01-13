
'use client';

import Link from "next/link";
import { ArrowRight, Car, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Room } from "@/lib/data";

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
      <span className="font-medium text-sm text-foreground">{ownerName}</span>
    </div>
  );
}

export function RoomCard({ room }: RoomCardProps) {
  const totalParticipants = room.participantIds.length;

  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
          {room.autoStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 shrink-0">
                    <Car className="mr-1 h-3 w-3" /> Ready
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>The owner has already found an auto.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 pt-1 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground"/> 
            <span className="truncate">{room.startingPoint} to {room.destination}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{`${totalParticipants} / ${room.passengerLimit} Riders`}</span>
          </div>
          <RoomOwner ownerName={room.ownerName} ownerAvatarUrl={room.ownerAvatarUrl} />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-gradient-to-r from-primary to-teal-400 text-primary-foreground">
          <Link href={`/dashboard/rooms/${room.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
