"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [vesId, setVesId] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthAction = () => {
    const vesIdRegex = /^[a-zA-Z0-9.]+@ves\.ac\.in$/;
    if (!vesIdRegex.test(vesId)) {
      toast({
        variant: "destructive",
        title: "Invalid VES ID",
        description: "Please use a valid VES email address (e.g., 2021.johndoe@ves.ac.in).",
      });
      return;
    }

    if (!isLogin && (!fullName || !college)) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields for sign up.",
        });
        return;
    }

    let name = "User";
    if (!isLogin) {
        name = fullName.split(' ')[0];
    } else {
        const idPart = vesId.split('@')[0];
        const namePart = idPart.split('.')[1] || idPart;
        name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }


    router.push(`/dashboard?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <Car className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">VES RideShare</CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Log in to your account" : "Create an account to start sharing rides"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  type="text" 
                  placeholder="e.g., Jane Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="ves-id">VES ID</Label>
              <Input 
                id="ves-id" 
                type="text" 
                placeholder="e.g., 2021.janedoe@ves.ac.in" 
                required 
                value={vesId}
                onChange={(e) => setVesId(e.target.value)}
              />
            </div>
             {!isLogin && (
               <div className="grid gap-2">
                <Label htmlFor="college">College</Label>
                <Select onValueChange={setCollege} value={college}>
                  <SelectTrigger id="college">
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VESIM">VES Institute of Management (VESIM)</SelectItem>
                    <SelectItem value="VESCOL">VES College of Law (VESCOL)</SelectItem>
                    <SelectItem value="VESIT">VES Institute of Technology (VESIT)</SelectItem>
                    <SelectItem value="VESASC">VES College of Arts, Science & Commerce (VESASC)</SelectItem>
                    <SelectItem value="VESCOP">VES College of Pharmacy (VESCOP)</SelectItem>
                    <SelectItem value="VESCOA">VES College of Architecture (VESCOA)</SelectItem>
                    <SelectItem value="VESPOLY">VES Polytechnic College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <Button className="w-full" onClick={handleAuthAction}>
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
