"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";


export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl">
            <Car className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold hidden sm:inline-block tracking-tight">
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
