"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();

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

                {/* Desktop CTA and Theme Toggle */}
                <div className="hidden md:flex items-center gap-2">
                    <Button asChild size="sm">
                        <Link href="/book">Book Now</Link>
                    </Button>
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