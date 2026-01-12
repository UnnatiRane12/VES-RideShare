"use client";

import Link from "next/link";
import { useState } from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

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
          <form className="grid gap-4">
            {!isLogin && (
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" type="text" placeholder="e.g., Jane Doe" required />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="ves-id">VES ID</Label>
              <Input id="ves-id" type="text" placeholder="e.g., 2021.janedoe" required />
            </div>
             {!isLogin && (
               <div className="grid gap-2">
                <Label htmlFor="college">College</Label>
                <Select>
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
              <Input id="password" type="password" required />
            </div>
            
            <Link href="/dashboard" className="w-full">
              <Button className="w-full">
                {isLogin ? "Login" : "Sign Up"}
              </Button>
            </Link>
          </form>
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
