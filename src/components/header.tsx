"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";


export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Car className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold hidden sm:inline-block">
            VES RideShare
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
