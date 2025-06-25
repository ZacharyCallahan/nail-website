import ContactForm from "@/app/components/ContactForm";
import { MainLayout } from "@/app/components/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";

export const metadata = {
    title: "Contact Us | Elegant Nails",
    description: "Contact Elegant Nails for appointments, questions, or feedback. We'd love to hear from you!",
};

export default function ContactPage() {
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/10 to-background py-20">
                <div className="container max-w-screen-xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Have questions or want to book an appointment? Reach out to us and we'll get back to you as soon as possible.
                    </p>
                </div>
            </section>

            <section className="py-16">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Contact Information */}
                        <div className="md:col-span-1">
                            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                                        <a href="tel:+15551234567" className="text-foreground font-medium hover:text-primary">
                                            (555) 123-4567
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                                        <a href="mailto:info@elegantnails.com" className="text-foreground font-medium hover:text-primary">
                                            info@elegantnails.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                                        <p className="text-foreground font-medium">
                                            123 Nail Street, Beauty City, ST 12345
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Hours</h3>
                                        <p className="text-foreground font-medium">
                                            Mon-Fri: 9AM-7PM
                                            <br />
                                            Sat: 9AM-6PM
                                            <br />
                                            Sun: 10AM-4PM
                                        </p>
                                    </div>
                                </div>

                                {/* Social Media */}
                                <div className="pt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Follow Us</h3>
                                    <div className="flex gap-3">
                                        <a
                                            href="https://instagram.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                                        >
                                            <Instagram className="h-5 w-5" />
                                        </a>
                                        <a
                                            href="https://facebook.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                                        >
                                            <Facebook className="h-5 w-5" />
                                        </a>
                                        <a
                                            href="https://twitter.com"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors"
                                        >
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Send Us a Message</CardTitle>
                                    <CardDescription>
                                        Fill out the form below and we'll get back to you as soon as possible.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ContactForm />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-12">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="border rounded-lg overflow-hidden">
                        <div className="h-[400px] bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">Google Maps would be embedded here</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 bg-muted/30">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Find quick answers to common questions about our services and policies.
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Do I need an appointment?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    While we do accept walk-ins based on availability, we strongly recommend booking an appointment to ensure you get your preferred time slot and nail technician.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What is your cancellation policy?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We require at least 24 hours' notice for cancellations or rescheduling. Late cancellations or no-shows may be subject to a cancellation fee.
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Do you offer gift cards?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Yes! Gift cards are available for purchase in-store or online. They make perfect gifts for birthdays, anniversaries, or any special occasion.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
} 