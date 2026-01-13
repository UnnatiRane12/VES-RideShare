
'use client';

import { ArrowRight, Car, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Room } from "@/lib/data";
import { Button } from "./ui/button";
import { useState } from "react";
import { RoomDetailsModal } from "./room-details-modal";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const totalParticipants = room.participantIds.length;

  return (
    <>
    <Card className="flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="pb-4">
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
      <CardContent>
        <div className="flex items-center justify-start text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">{`${totalParticipants} / ${room.passengerLimit} Riders`}</span>
          </div>
        </div>
      </CardContent>
       <CardFooter className="pt-4">
        <Button onClick={() => setIsModalOpen(true)} className="w-full bg-gradient-to-r from-primary/90 to-teal-400/90 text-primary-foreground hover:scale-105 transition-transform">
            View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
    {isModalOpen && <RoomDetailsModal room={room} onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
