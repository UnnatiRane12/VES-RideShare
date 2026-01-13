
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useUser } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleAuthAction = async () => {
    if (!auth || !firestore) {
      toast({
        variant: "destructive",
        title: "Services not ready",
        description: "Authentication services are not available yet. Please try again in a moment.",
      });
      return;
    }

    if (!email.endsWith('@ves.ac.in')) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "You must use a valid '@ves.ac.in' email address to access this service.",
      });
      return;
    }
    
    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Password too short",
            description: "Your password must be at least 6 characters long.",
        });
        return;
    }

    try {
      if (!isLogin) { // Sign Up
          if (!fullName) {
              toast({
                  variant: "destructive",
                  title: "Missing Information",
                  description: "Please fill out all fields for sign up.",
              });
              return;
          }
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const newUser = userCredential.user;

          if (newUser) {
            await updateProfile(newUser, { displayName: fullName });
            await sendEmailVerification(newUser);

            const userRef = doc(firestore, "users", newUser.uid);
            const [firstName, ...lastNameParts] = fullName.split(' ');
            const lastName = lastNameParts.join(' ');
            const userData = {
              email: email,
              firstName: firstName || '',
              lastName: lastName || '',
              college: college || '',
            };
            await setDoc(userRef, userData);

            toast({
              title: "Account Created!",
              description: "A verification link has been sent to your email. Please verify your account before logging in.",
            });
            setIsLogin(true); // Switch to login view after successful sign-up
          }

      } else { // Login
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
           if (!userCredential.user.emailVerified) {
            await auth.signOut(); // Log out unverified user
            toast({
              variant: "destructive",
              title: "Email Not Verified",
              description: "You must verify your email address before logging in. Please check your inbox for the verification link.",
            });
          } else {
            router.push('/dashboard');
          }
      }
    } catch (error: any) {
        let title = "Authentication Failed";
        let description = "An unexpected error occurred. Please try again.";

        switch (error.code) {
          case 'auth/invalid-credential':
             description = "The email or password you entered is incorrect. Please check your credentials and try again.";
             break;
          case 'auth/user-not-found':
            description = "No account found with this email address. Please sign up first.";
            break;
          case 'auth/wrong-password':
            description = "Incorrect password. Please try again.";
            break;
          case 'auth/email-already-in-use':
            title = "Sign Up Failed";
            description = "An account with this email already exists. Please log in instead.";
            break;
          default:
            description = error.message || description;
            break;
        }

         toast({
            variant: "destructive",
            title: title,
            description: description,
        });
    }
  };
  
    if (isUserLoading) {
        return (
          <div className="flex min-h-screen items-center justify-center bg-background">
            <p>Loading...</p> 
          </div>
        );
    }
    
    if (user && !user.emailVerified) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Please Verify Your Email</h1>
                    <p className="text-muted-foreground">A verification link has been sent to <span className="font-semibold text-primary">{user.email}</span>.</p>
                    <p className="text-muted-foreground mt-1">Check your inbox to continue.</p>
                     <Button variant="link" className="mt-4" onClick={() => auth.signOut()}>Log out</Button>
                </div>
            </div>
        );
    }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
              <Car className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-400">VES RideShare</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {isLogin ? "Welcome back! Please log in." : "Join our community of student commuters."}
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
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="e.g., jane.doe@ves.ac.in" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
             {!isLogin && (
               <div className="grid gap-2">
                <Label htmlFor="college">College (Optional)</Label>
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
            
            <Button className="w-full bg-gradient-to-r from-primary to-teal-400 text-primary-foreground hover:scale-105 transition-transform" onClick={handleAuthAction}>
              {isLogin ? "Login" : "Create Account"}
            </Button>
            
          </div>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button variant="link" className="p-0 h-auto font-semibold text-teal-400" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
