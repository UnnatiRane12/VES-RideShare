
"use client";

import Link from "next/link";
import { useUser } from "@/firebase";
import { MapPinPlus, Search, Car, Leaf, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);
  
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const name = user?.displayName || 'User';

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {name}!</h1>
        <p className="text-muted-foreground">Ready to share a ride? Get started below.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/create">
          <Card className="h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">Create a Ride</CardTitle>
              <MapPinPlus className="h-8 w-8 text-accent" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Have a ride to share? Create a room and let others join you. Set your destination and find fellow travellers.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/find">
          <Card className="h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-2xl font-bold">Find a Ride</CardTitle>
              <Search className="h-8 w-8 text-accent" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Looking for a ride? Search for available rooms heading to your destination or nearby locations.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Why Share Your Ride?</CardTitle>
          <CardDescription>Discover the benefits of carpooling with VES RideShare.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-accent/20 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold">Eco-Friendly</h3>
            <p className="text-sm text-muted-foreground">Fewer cars on the road means reduced carbon emissions and a healthier planet for everyone.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-accent/20 p-3 rounded-full">
                <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-semibold">Build Community</h3>
            <p className="text-sm text-muted-foreground">Connect with fellow students from different VES colleges, make new friends, and expand your network.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-2">
            <div className="bg-primary/20 p-3 rounded-full">
                <Car className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold">Save Money & Time</h3>
            <p className="text-sm text-muted-foreground">Split travel costs for autos and taxis. Plus, finding a ride is faster when you do it together.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
