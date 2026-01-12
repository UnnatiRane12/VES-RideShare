import { RoomCard } from "@/components/room-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rooms } from "@/lib/data";
import { Lightbulb, Search, Sparkles } from "lucide-react";

export default function FindRoomPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find a Ride
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-point">Starting Point</Label>
                <Input id="start-point" placeholder="e.g., Chembur Station" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="e.g., VESIT" />
              </div>
              <Button className="w-full">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Alert className="mt-6 bg-primary/10 border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary">Smart Suggestions</AlertTitle>
          <AlertDescription>
            Our AI can help you find rides to nearby destinations or suggest common routes to your goal. Try searching to see suggestions!
          </AlertDescription>
        </Alert>

      </div>
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Available Rooms</h2>
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full">
            <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No Rooms Found</h3>
            <p className="text-muted-foreground mt-2">
              There are no available rooms right now. Try creating one!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
