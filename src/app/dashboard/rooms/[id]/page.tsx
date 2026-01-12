import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Car, Clock, Edit, MapPin, Users, CheckCircle, Hourglass } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { findRoomById, findUserById } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { notFound } from "next/navigation";

export default function RoomDetailsPage({ params }: { params: { id: string } }) {
  const room = findRoomById(params.id);
  if (!room) {
    notFound();
  }

  const owner = findUserById(room.ownerId);
  const participants = room.participantIds.map(id => findUserById(id)).filter(Boolean) as any[];
  const allRiders = owner ? [owner, ...participants] : participants;
  const currentCapacity = allRiders.length;
  const isFull = currentCapacity >= room.capacity;
  const mapPlaceholder = PlaceHolderImages.find(img => img.id === 'map-placeholder');

  const timeRemaining = room.expiresAt.getTime() - new Date().getTime();
  const minutesRemaining = Math.round(timeRemaining / 60000);

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
                <CardTitle className="text-2xl">{room.name}</CardTitle>
                <div className="flex items-center justify-between text-muted-foreground text-sm pt-2">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{room.startPoint} to {room.destination}</span>
                    </div>
                     {room.hasAuto && <Badge variant="secondary" className="bg-accent/20 text-accent-foreground"><Car className="mr-1 h-3 w-3 text-accent" /> Auto Ready</Badge>}
                </div>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-sm font-medium">
                            <span className="flex items-center gap-1"><Users className="h-4 w-4" /> Capacity</span>
                            <span>{currentCapacity} / {room.capacity}</span>
                        </div>
                        <Progress value={(currentCapacity / room.capacity) * 100} />
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
                            {allRiders.map((rider, index) => (
                            <div key={rider.id} className="flex flex-col items-center gap-1 w-16 text-center">
                                <Avatar>
                                    <AvatarImage src={rider.avatarUrl} alt={rider.name} />
                                    <AvatarFallback>{rider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs truncate w-full">{rider.name}</span>
                                {index === 0 && <Badge variant="outline" className="text-xs">Owner</Badge>}
                            </div>
                            ))}
                        </div>
                    </div>
                     <Separator/>
                     <div className="flex items-center gap-2">
                         <Button className="w-full" disabled={isFull}>
                            {isFull ? <><CheckCircle className="mr-2 h-4 w-4" /> Ride is Full</> : 'Join Ride'}
                        </Button>
                        <Button variant="outline" size="icon">
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
