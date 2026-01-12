
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

export default function MyRidesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Ride History</CardTitle>
        <CardDescription>A list of all your past and upcoming rides.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-64">
          <History className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No Rides Yet</h3>
          <p className="text-muted-foreground mt-2">
            You haven't joined or created any rides.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
