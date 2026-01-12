"use client";

import Link from "next/link";
import { Car } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export function Header() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');

  return (
    <header className="bg-card sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={{ pathname: "/dashboard", query: { name: name || undefined } }} className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Car className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold hidden sm:inline-block">
            VES RideShare
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild>
            <Link href={{ pathname: "/dashboard/create", query: { name: name || undefined } }}>Create Ride</Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
