
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
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Separator } from "@/components/ui/separator";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.978,36.62,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [vesId, setVesId] = useState("");
  const [password, setPassword] = useState("");
  const [college, setCollege] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user exists in Firestore
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // New user, create a document in Firestore
            const [firstName, ...lastNameParts] = (user.displayName || "").split(" ");
            const lastName = lastNameParts.join(" ");
            
            await setDoc(userDocRef, {
                id: user.uid,
                vesId: user.email,
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                college: "", // Google sign-in doesn't provide college
            });
        }
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Google Sign-In Failed",
            description: error.message || "An unexpected error occurred.",
        });
    }
  };

  const handleAuthAction = async () => {
    const vesIdRegex = /^[a-zA-Z0-9.]+@ves\.ac\.in$/;
    if (!vesIdRegex.test(vesId)) {
      toast({
        variant: "destructive",
        title: "Invalid VES ID",
        description: "Please use a valid VES email address (e.g., 2021.johndoe@ves.ac.in).",
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
          if (!fullName || !college) {
              toast({
                  variant: "destructive",
                  title: "Missing Information",
                  description: "Please fill out all fields for sign up.",
              });
              return;
          }
          const userCredential = await createUserWithEmailAndPassword(auth, vesId, password);
          const newUser = userCredential.user;

          if (newUser) {
            // Update Firebase Auth profile
            await updateProfile(newUser, { displayName: fullName });

            const userRef = doc(firestore, "users", newUser.uid);
            const [firstName, lastName] = fullName.split(' ');
            const userData = {
              id: newUser.uid,
              vesId: vesId,
              email: vesId,
              firstName: firstName || '',
              lastName: lastName || '',
              college: college,
            };
            // Use setDoc to save user data to Firestore
            await setDoc(userRef, userData);

            router.push('/dashboard');
          }

      } else { // Login
          await signInWithEmailAndPassword(auth, vesId, password);
          router.push('/dashboard');
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
  
    if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p> 
      </div>
    );
  }


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="mx-auto w-full max-w-sm shadow-2xl">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <Car className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500">VES RideShare</CardTitle>
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
              {isLogin ? "Login" : "Create Account"}
            </Button>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
              <GoogleIcon className="mr-2 h-4 w-4" />
              Google
            </Button>

          </div>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Button variant="link" className="p-0 h-auto font-semibold" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Sign Up" : "Login"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
