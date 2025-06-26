import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";

// Sample service categories and services (in a real app, this would come from a database)
const serviceCategories = [
    {
        id: "manicures",
        title: "Manicures",
        services: [
            {
                id: "classic-manicure",
                title: "Classic Manicure",
                description: "A traditional manicure with nail shaping, cuticle care, hand massage, and polish.",
                price: "$25",
                duration: "30 min",
            },
            {
                id: "gel-manicure",
                title: "Gel Manicure",
                description: "Long-lasting gel polish application with nail shaping and cuticle care.",
                price: "$40",
                duration: "45 min",
            },
            {
                id: "spa-manicure",
                title: "Spa Manicure",
                description: "Premium manicure with exfoliation, hydrating mask, extended massage, and polish.",
                price: "$35",
                duration: "45 min",
            },
        ],
    },
    {
        id: "pedicures",
        title: "Pedicures",
        services: [
            {
                id: "classic-pedicure",
                title: "Classic Pedicure",
                description: "Relaxing foot soak, nail shaping, callus removal, foot massage, and polish.",
                price: "$40",
                duration: "45 min",
            },
            {
                id: "deluxe-pedicure",
                title: "Deluxe Pedicure",
                description: "Premium pedicure with exfoliating scrub, hydrating mask, extended massage, and polish.",
                price: "$55",
                duration: "60 min",
            },
            {
                id: "gel-pedicure",
                title: "Gel Pedicure",
                description: "Classic pedicure with long-lasting gel polish application.",
                price: "$60",
                duration: "60 min",
            },
        ],
    },
    {
        id: "nail-enhancements",
        title: "Nail Enhancements",
        services: [
            {
                id: "acrylic-full-set",
                title: "Acrylic Full Set",
                description: "Full set of acrylic nails with your choice of length and shape.",
                price: "$70",
                duration: "75 min",
            },
            {
                id: "gel-extensions",
                title: "Gel Extensions",
                description: "Full set of gel nail extensions for a natural look and feel.",
                price: "$80",
                duration: "90 min",
            },
            {
                id: "acrylic-fill",
                title: "Acrylic Fill",
                description: "Maintenance fill for existing acrylic nails.",
                price: "$45",
                duration: "45 min",
            },
        ],
    },
    {
        id: "nail-art",
        title: "Nail Art & Add-ons",
        services: [
            {
                id: "simple-nail-art",
                title: "Simple Nail Art",
                description: "Basic designs including French tips, ombre, or simple patterns.",
                price: "$10+",
                duration: "15+ min",
            },
            {
                id: "complex-nail-art",
                title: "Complex Nail Art",
                description: "Detailed designs, hand-painted art, or 3D embellishments.",
                price: "$25+",
                duration: "30+ min",
            },
            {
                id: "nail-repair",
                title: "Nail Repair",
                description: "Fix a broken nail or touch up chipped polish.",
                price: "$8 per nail",
                duration: "10 min",
            },
        ],
    },
];

export const metadata = {
    title: "Nail Services | Elegant Nails",
    description: "Explore our range of professional nail services including manicures, pedicures, nail enhancements, and nail art.",
};

export default function ServicesPage() {
    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/10 to-background py-20 md:py-32">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Services</h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-10">
                            Choose from our wide range of nail care services, performed by our professional nail technicians using premium products.
                        </p>
                        <Button asChild size="lg">
                            <Link href="/book">Book Appointment</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="py-16 md:py-24">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <nav className="mb-10 flex flex-wrap gap-4 justify-center">
                        {serviceCategories.map((category) => (
                            <Link
                                key={category.id}
                                href={`#${category.id}`}
                                className="px-4 py-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {category.title}
                            </Link>
                        ))}
                    </nav>

                    {serviceCategories.map((category) => (
                        <div key={category.id} id={category.id} className="mb-16 scroll-mt-20">
                            <h2 className="text-3xl font-bold mb-8 border-b pb-4">{category.title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {category.services.map((service) => (
                                    <Card key={service.id} id={service.id} className="h-full flex flex-col">
                                        <CardHeader>
                                            <CardTitle>{service.title}</CardTitle>
                                            <div className="flex justify-between items-center text-lg font-medium text-primary mt-2">
                                                <span>{service.price}</span>
                                                <span className="text-sm text-muted-foreground">{service.duration}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <CardDescription className="text-foreground text-base">
                                                {service.description}
                                            </CardDescription>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full">
                                                <Link href={`/book?service=${service.id}`}>Book Now</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 bg-muted/30">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>

                        <div className="space-y-6">
                            <div className="bg-card rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">How long do gel nails last?</h3>
                                <p className="text-muted-foreground">
                                    Gel nails typically last 2-3 weeks without chipping or peeling, depending on how quickly your natural nails grow and how well you care for them.
                                </p>
                            </div>

                            <div className="bg-card rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">Can I get a pedicure if I have a foot condition?</h3>
                                <p className="text-muted-foreground">
                                    It depends on the condition. For your safety, we may not be able to provide services if you have certain infections or open wounds. Please consult with your doctor before booking if you&apos;re concerned.
                                </p>
                            </div>

                            <div className="bg-card rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">How often should I get a manicure?</h3>
                                <p className="text-muted-foreground">
                                    For regular polish, we recommend a manicure every 1-2 weeks. For gel polish, every 2-3 weeks is typical. Acrylic or gel enhancements usually require maintenance every 3-4 weeks.
                                </p>
                            </div>

                            <div className="bg-card rounded-lg p-6 shadow-sm">
                                <h3 className="text-xl font-semibold mb-3">Do you sanitize your tools?</h3>
                                <p className="text-muted-foreground">
                                    Absolutely! We follow strict sanitation protocols for all our tools and equipment. Many of our tools are disposable and single-use, while others are sterilized after each client.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 md:py-24 bg-primary text-primary-foreground">
                <div className="container max-w-screen-xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your Service?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                        Experience the Elegant Nails difference today. Our talented technicians are ready to pamper you!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/book">Book Appointment</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10" asChild>
                            <Link href="/contact">Contact Us</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
} 