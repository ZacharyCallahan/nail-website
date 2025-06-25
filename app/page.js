import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Sample service data (in a real app, this would come from a database)
const featuredServices = [
  {
    id: 1,
    title: "Classic Manicure",
    description: "A perfect maintenance treatment for your hands and nails.",
    price: "$25",
    duration: "30 min",
    image: "/images/services/manicure.jpg"
  },
  {
    id: 2,
    title: "Deluxe Pedicure",
    description: "Pamper your feet with our luxurious pedicure treatment.",
    price: "$45",
    duration: "45 min",
    image: "/images/services/pedicure.jpg"
  },
  {
    id: 3,
    title: "Gel Nail Extensions",
    description: "Long-lasting gel nails with a perfect finish.",
    price: "$60",
    duration: "60 min",
    image: "/images/services/gel-nails.jpg"
  },
  {
    id: 4,
    title: "Nail Art Design",
    description: "Express yourself with our creative nail art designs.",
    price: "$15+",
    duration: "15+ min",
    image: "/images/services/nail-art.jpg"
  }
];

// Sample testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    comment: "Absolutely love how my nails turned out! The staff was professional and the salon was immaculate.",
    rating: 5
  },
  {
    id: 2,
    name: "Michael Thompson",
    comment: "Got a pedicure for the first time here and it was amazing. Very relaxing experience.",
    rating: 5
  },
  {
    id: 3,
    name: "Jennifer Davis",
    comment: "The nail art designs they create are incredible! Always get compliments on my nails.",
    rating: 5
  }
];

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-background">
        <div className="container max-w-screen-xl mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Beautiful Nails, <span className="text-primary">Exceptional Service</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Experience luxurious nail treatments in a relaxing environment with our skilled technicians.
            Your journey to beautiful nails starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild>
              <Link href="/book">Book Appointment</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/services">View Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer a variety of nail services to meet your needs, from simple manicures to complex nail art designs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-3 left-3 z-20 text-white">
                    <p className="font-bold">{service.price}</p>
                    <p className="text-xs opacity-80">{service.duration}</p>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/services#${service.id}`}>Learn More</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild>
              <Link href="/services">View All Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Elegant Nails?</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Professional Staff</h3>
                  <p className="text-muted-foreground">
                    Our technicians are highly trained professionals who prioritize quality and hygiene.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Premium Products</h3>
                  <p className="text-muted-foreground">
                    We use only high-quality, non-toxic products for all our services.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Relaxing Environment</h3>
                  <p className="text-muted-foreground">
                    Enjoy our peaceful atmosphere and comfortable chairs while we pamper your hands and feet.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Button variant="outline" asChild>
                  <Link href="/about">Learn More About Us</Link>
                </Button>
              </div>
            </div>

            <div className="relative h-[400px] w-full rounded-lg overflow-hidden order-1 md:order-2">
              <div className="absolute inset-0 bg-black/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-card">
                <CardHeader>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < testimonial.rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <CardDescription className="text-foreground italic">"{testimonial.comment}"</CardDescription>
                </CardHeader>
                <CardFooter>
                  <p className="font-medium">- {testimonial.name}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container max-w-screen-xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Beautiful Nails?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Book your appointment today and experience the Elegant Nails difference.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/book">Book Your Appointment</Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}
