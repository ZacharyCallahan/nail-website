"use client";

import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-background border-t">
            <div className="container max-w-screen-xl py-12 px-4 sm:px-6 lg:py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div>
                        <h2 className="text-xl font-bold text-primary mb-4">Elegant Nails</h2>
                        <p className="text-muted-foreground mb-4">
                            Premium nail salon offering professional nail care services in a relaxing environment.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            </Link>
                            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            </Link>
                            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/services" className="text-muted-foreground hover:text-primary">
                                    Our Services
                                </Link>
                            </li>
                            <li>
                                <Link href="/book" className="text-muted-foreground hover:text-primary">
                                    Book Appointment
                                </Link>
                            </li>
                            <li>
                                <Link href="/gallery" className="text-muted-foreground hover:text-primary">
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Hours Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Hours</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Monday - Friday: 9AM - 7PM</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Saturday: 9AM - 6PM</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Sunday: 10AM - 4PM</span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0" />
                                <span>123 Nail Street, Beauty City, ST 12345</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <Link href="tel:+15551234567" className="hover:text-primary">
                                    (555) 123-4567
                                </Link>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <Link href="mailto:info@elegantnails.com" className="hover:text-primary">
                                    info@elegantnails.com
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/60 text-center text-muted-foreground text-sm">
                    <p>© {currentYear} Elegant Nails. All rights reserved.</p>
                    <div className="mt-2 space-x-4">
                        <Link href="/privacy-policy" className="hover:text-primary">
                            Privacy Policy
                        </Link>
                        <Link href="/terms-of-service" className="hover:text-primary">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
} 