import Link from "next/link";
import { MapPinPlus, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, John!</h1>
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
    </div>
  );
}
