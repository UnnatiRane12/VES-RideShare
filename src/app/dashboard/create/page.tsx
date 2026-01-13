
"use client";

import Link from "next/link";
import { ArrowLeft, Car, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { extractRideDetails } from "@/ai/flows/extract-ride-details";


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
  const [aiQuery, setAiQuery] = useState("");
  const [isExtracting, startTransition] = useTransition();

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

  const handleAiExtract = () => {
    if (!aiQuery) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please describe your ride in the text box.",
      });
      return;
    }
    startTransition(async () => {
      try {
        const result = await extractRideDetails({ query: aiQuery });
        if (result) {
          form.setValue("name", result.name, { shouldValidate: true });
          form.setValue("startingPoint", result.startingPoint, { shouldValidate: true });
          form.setValue("destination", result.destination, { shouldValidate: true });
          form.setValue("passengerLimit", result.passengerLimit, { shouldValidate: true });
          toast({
            title: "Details Extracted!",
            description: "The form has been populated with the extracted details.",
          });
        }
      } catch (error) {
        console.error("AI extraction failed:", error);
        toast({
          variant: "destructive",
          title: "AI Extraction Failed",
          description: "Could not extract details from your request. Please fill the form manually.",
        });
      }
    });
  };

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
      <div className="max-w-2xl mx-auto">
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
    );
  }

  return (
     <div className="max-w-2xl mx-auto space-y-8">
        
        <Card className="shadow-lg bg-card/80 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary"/>
                    Describe Your Ride with AI
                </CardTitle>
                <CardDescription>
                    No time to fill out the form? Just type what you need below and let AI handle it.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Textarea
                    placeholder="e.g., 'Need a ride from Chembur to VESIT for 3 people tomorrow morning'"
                    className="flex-grow"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    disabled={isExtracting}
                />
                <Button onClick={handleAiExtract} disabled={isExtracting} className="bg-gradient-to-r from-primary/80 to-teal-400/80 text-primary-foreground">
                    {isExtracting ? "Generating..." : "Generate with AI"}
                </Button>
            </CardContent>
        </Card>

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
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
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
                        <FormItem>
                            <FormLabel>Auto/Cab Secured?</FormLabel>
                             <div className="flex items-center space-x-2 rounded-md border p-2 h-10">
                                <FormControl>
                                <Switch
                                    id="auto-status-switch"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                </FormControl>
                                <label htmlFor="auto-status-switch" className="text-sm text-muted-foreground">{field.value ? "Yes, I have a ride" : "Not yet"}</label>
                            </div>
                         </FormItem>
                        )}
                    />
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" asChild type="button">
                    <Link href="/dashboard">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={form.formState.isSubmitting || isExtracting} className="bg-gradient-to-r from-primary to-teal-400 text-primary-foreground">
                    {form.formState.isSubmitting ? "Creating..." : "Create Room"}
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
    </div>
  );
}
