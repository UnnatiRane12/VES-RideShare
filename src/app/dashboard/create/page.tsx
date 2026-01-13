
"use client";

import Link from "next/link";
import { ArrowLeft, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(3, "Room name must be at least 3 characters."),
  startingPoint: z.string().min(1, "Starting point is required."),
  destination: z.string().min(1, "Destination is required."),
  passengerLimit: z.coerce.number().min(2).max(4),
  autoStatus: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateRoomPage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startingPoint: "",
      destination: "",
      passengerLimit: 3,
      autoStatus: false,
    },
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to create a room.",
      });
      return;
    }

    try {
      const newRoomData = {
        ...data,
        ownerId: user.uid,
        ownerName: user.displayName,
        ownerAvatarUrl: user.photoURL || null,
        participantIds: [user.uid],
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(firestore, "sharingRooms"), newRoomData);

      toast({
        title: "Room Created!",
        description: `Your room "${data.name}" has been successfully created.`,
      });
      router.push("/dashboard/find");

    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem creating your room. Please try again.",
      });
    }
  };
  
  if (!isClient) {
     return (
      <div className="flex flex-col-reverse lg:flex-row gap-8 max-w-6xl mx-auto">
        <div className="w-full lg:w-2/3">
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
        <div className="w-full lg:w-1/3">
            <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
     <div className="flex flex-col-reverse lg:flex-row gap-8 max-w-6xl mx-auto">
      <div className="w-full lg:w-2/3">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
        </Link>
        <Card className="shadow-lg">
            <CardHeader>
            <CardTitle className="text-3xl font-bold tracking-tight">Create a Sharing Room</CardTitle>
            <CardDescription>Fill out the details below to open your ride for sharing.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Room Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Morning Commute to College" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="startingPoint"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Starting Point</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Chembur Station" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Destination</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., VESIT" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="passengerLimit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Total Seats (including you)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select total number of seats" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="2">2 People</SelectItem>
                            <SelectItem value="3">3 People</SelectItem>
                            <SelectItem value="4">4 People</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <FormField
                        control={form.control}
                        name="autoStatus"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm h-full mt-auto">
                            <div className="space-y-0.5">
                            <FormLabel className="text-base">Auto/Cab Secured?</FormLabel>
                            </div>
                            <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            </FormControl>
                        </FormItem>
                        )}
                    />
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" asChild type="button">
                    <Link href="/dashboard">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting} className="bg-gradient-to-r from-primary to-teal-400 text-primary-foreground">
                    {form.formState.isSubmitting ? "Creating..." : "Create Room"}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
      </div>
      <div className="w-full lg:w-1/3 space-y-6">
        <Card className="bg-card/50 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    How it Works
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. <span className="font-semibold text-foreground">Fill in the Details:</span> Name your room, set your start and end points, and choose the number of seats.</p>
                <p>2. <span className="font-semibold text-foreground">Find Riders:</span> Your room will be visible to other students looking for a ride on the same route.</p>
                <p>3. <span className="font-semibold text-foreground">Ride Together:</span> Once your room is full, you can coordinate with your fellow riders and share the journey!</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
