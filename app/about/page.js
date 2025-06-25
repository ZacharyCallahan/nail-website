import { MainLayout } from "@/app/components/MainLayout";
import { Award, Clock, Heart, MapPin, Shield, Users } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "About Us | Elegant Nails",
    description: "Learn about Elegant Nails, our story, our team, and our commitment to providing premium nail care services.",
};

export default function AboutPage() {
    const teamMembers = [
        {
            name: "Sarah Johnson",
            role: "Founder & Master Nail Technician",
            bio: "With over 15 years of experience, Sarah founded Elegant Nails with a vision to provide premium nail care in a relaxing environment.",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&h=300&auto=format&fit=crop",
        },
        {
            name: "Michael Lee",
            role: "Nail Art Specialist",
            bio: "Michael is known for his intricate nail art designs and attention to detail. He specializes in 3D nail art and hand-painted designs.",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&h=300&auto=format&fit=crop",
        },
        {
            name: "Jessica Smith",
            role: "Senior Nail Technician",
            bio: "Jessica specializes in natural nail care and pedicures. Her gentle approach and precision make her a client favorite.",
            image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=300&h=300&auto=format&fit=crop",
        },
    ];

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/10 to-background py-20">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">About Elegant Nails</h1>
                        <p className="text-lg text-muted-foreground">
                            A premium nail salon dedicated to exceptional service, quality products, and creating a relaxing experience for every client.
                        </p>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-16 md:py-24">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-[400px] rounded-lg overflow-hidden">
                            <div className="absolute inset-0 bg-black/5"></div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                            <div className="space-y-4">
                                <p>
                                    Elegant Nails was founded in 2010 with a simple mission: to provide exceptional nail care in a luxurious yet comfortable environment. What started as a small salon with three stations has grown into a beloved establishment with a loyal clientele.
                                </p>
                                <p>
                                    Our founder, Sarah Johnson, brought her 15 years of experience and passion for nail artistry to create a space where clients can relax, unwind, and leave feeling beautiful and confident.
                                </p>
                                <p>
                                    Over the years, we've expanded our services and our team, but our commitment to quality and customer satisfaction remains unchanged. We use only premium products, maintain the highest standards of cleanliness, and stay at the forefront of nail care trends and techniques.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 bg-muted/30">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            These principles guide everything we do at Elegant Nails
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="bg-background p-6 rounded-lg shadow-sm">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Heart className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Customer Care</h3>
                            <p className="text-muted-foreground">
                                Our clients are at the heart of everything we do. Your comfort and satisfaction are our top priorities.
                            </p>
                        </div>

                        <div className="bg-background p-6 rounded-lg shadow-sm">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Award className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Quality</h3>
                            <p className="text-muted-foreground">
                                We use only premium products and continually train our staff to ensure the highest quality service.
                            </p>
                        </div>

                        <div className="bg-background p-6 rounded-lg shadow-sm">
                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Hygiene</h3>
                            <p className="text-muted-foreground">
                                Your safety is non-negotiable. We maintain strict cleanliness protocols and sterilize all tools.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 md:py-24">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our skilled team of nail technicians is passionate about nail care and committed to providing you with the best service possible.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-background border rounded-lg overflow-hidden">
                                <div className="relative h-72 w-full">
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                    <p className="text-primary font-medium mb-3">{member.role}</p>
                                    <p className="text-muted-foreground">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Location & Hours */}
            <section className="py-16 bg-muted/30">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Visit Us</h2>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-medium mb-1">Our Location</h3>
                                        <p className="text-muted-foreground">123 Nail Street, Beauty City, ST 12345</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="h-6 w-6 text-primary shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-medium mb-1">Business Hours</h3>
                                        <ul className="text-muted-foreground space-y-1">
                                            <li>Monday - Friday: 9:00 AM - 7:00 PM</li>
                                            <li>Saturday: 9:00 AM - 6:00 PM</li>
                                            <li>Sunday: 10:00 AM - 4:00 PM</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="/contact"
                                className="inline-flex px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Contact Us
                            </a>
                        </div>

                        <div className="h-[300px] md:h-full relative rounded-lg overflow-hidden">
                            {/* This would be a Google Maps embed in a real application */}
                            <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                <p className="text-muted-foreground">Google Maps would be embedded here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container max-w-screen-xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Experience Elegant Nails?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Book your appointment today and let us pamper you with our exceptional nail services.
                    </p>
                    <a
                        href="/book"
                        className="inline-flex px-6 py-3 bg-white text-primary rounded-md hover:bg-white/90 transition-colors font-medium"
                    >
                        Book Appointment
                    </a>
                </div>
            </section>
        </MainLayout>
    );
} 