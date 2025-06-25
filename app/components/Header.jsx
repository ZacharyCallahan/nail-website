"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Menu, Moon, Sun, User, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const navigationItems = [
        { name: "Home", href: "/" },
        { name: "Services", href: "/services" },
        { name: "Gallery", href: "/gallery" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    // Get user initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return "UN";
        return name
            .split(" ")
            .map(part => part[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Check if user is admin
    const isAdmin = session?.user?.role === "ADMIN";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-xl items-center">
                <div className="mr-4 flex">
                    <Link href="/" className="flex items-center">
                        <span className="text-xl font-bold text-primary">Elegant Nails</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden flex-1 items-center justify-center md:flex">
                    <ul className="flex space-x-6">
                        {navigationItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className="text-sm font-medium transition-colors hover:text-primary"
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Desktop CTA, Auth, and Theme Toggle */}
                <div className="hidden md:flex items-center gap-2">
                    <Button asChild size="sm" className="mr-2">
                        <Link href="/book">Book Now</Link>
                    </Button>

                    {/* Auth buttons or user dropdown */}
                    {isLoading ? (
                        <div className="h-9 w-20 animate-pulse bg-muted rounded-md"></div>
                    ) : session?.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={session.user.image || undefined} />
                                        <AvatarFallback>{getInitials(session.user.name || "User")}</AvatarFallback>
                                    </Avatar>
                                    <span className="max-w-[100px] truncate">{session.user.name || "User"}</span>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="w-full cursor-pointer">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/appointments" className="w-full cursor-pointer">My Appointments</Link>
                                </DropdownMenuItem>
                                {isAdmin && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin" className="w-full cursor-pointer">Admin Dashboard</Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/auth/signin">Sign In</Link>
                            </Button>
                            <Button size="sm" asChild>
                                <Link href="/auth/signup">Sign Up</Link>
                            </Button>
                        </div>
                    )}

                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex flex-1 items-center justify-end md:hidden">
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="mr-2">
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-y-auto pb-20 bg-background shadow-md animate-in md:hidden">
                    <nav className="container pt-6">
                        <ul className="grid gap-3">
                            {navigationItems.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="flex w-full items-center py-3 text-lg font-medium hover:text-primary"
                                        onClick={toggleMenu}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}

                            {/* Auth links for mobile */}
                            {!isLoading && (
                                session?.user ? (
                                    <>
                                        <li>
                                            <Link
                                                href="/profile"
                                                className="flex w-full items-center py-3 text-lg font-medium hover:text-primary"
                                                onClick={toggleMenu}
                                            >
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href="/appointments"
                                                className="flex w-full items-center py-3 text-lg font-medium hover:text-primary"
                                                onClick={toggleMenu}
                                            >
                                                My Appointments
                                            </Link>
                                        </li>
                                        {isAdmin && (
                                            <li>
                                                <Link
                                                    href="/admin"
                                                    className="flex w-full items-center py-3 text-lg font-medium hover:text-primary"
                                                    onClick={toggleMenu}
                                                >
                                                    Admin Dashboard
                                                </Link>
                                            </li>
                                        )}
                                        <li>
                                            <Button
                                                variant="destructive"
                                                className="w-full"
                                                onClick={() => {
                                                    signOut({ callbackUrl: "/" });
                                                    toggleMenu();
                                                }}
                                            >
                                                Log out
                                            </Button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href="/auth/signin" onClick={toggleMenu}>
                                                    Sign In
                                                </Link>
                                            </Button>
                                        </li>
                                        <li>
                                            <Button asChild className="w-full">
                                                <Link href="/auth/signup" onClick={toggleMenu}>
                                                    Sign Up
                                                </Link>
                                            </Button>
                                        </li>
                                    </>
                                )
                            )}

                            <li className="mt-4">
                                <Button asChild className="w-full" size="lg">
                                    <Link href="/book" onClick={toggleMenu}>
                                        Book Now
                                    </Link>
                                </Button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </header>
    );
} 