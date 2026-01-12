
"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateRoomPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
     return (
      <div className="w-full max-w-2xl mx-auto">
        <Skeleton className="h-6 w-40 mb-4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="grid gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-11" />
                <Skeleton className="h-4 w-40" />
            </div>
             <div className="flex justify-end gap-2 mt-4">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Sharing Room</CardTitle>
          <CardDescription>Fill out the details below to open your ride for sharing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="room-name">Room Name</Label>
              <Input id="room-name" placeholder="e.g., Morning Ride to College" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start-point">Starting Point</Label>
                <Input id="start-point" placeholder="e.g., Chembur Station" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="e.g., VESIT" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label htmlFor="capacity">Passenger Limit</Label>
                <Select>
                  <SelectTrigger id="capacity">
                    <SelectValue placeholder="Select number of seats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 People</SelectItem>
                    <SelectItem value="3">3 People</SelectItem>
                    <SelectItem value="4">4 People</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiration">Room Expiration</Label>
                <Select>
                  <SelectTrigger id="expiration">
                    <SelectValue placeholder="Set expiration time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">in 15 minutes</SelectItem>
                    <SelectItem value="30">in 30 minutes</SelectItem>
                    <SelectItem value="60">in 1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-status" />
              <Label htmlFor="auto-status">I have already found an auto</Label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                </Button>
                <Button>
                    Create Room
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
