import { MainLayout } from "@/app/components/MainLayout";
import { Card, CardContent } from "@/app/components/ui/card";
import Image from "next/image";

// Sample gallery images (in a real app, these would come from a CMS or database)
const galleryItems = [
    {
        id: 1,
        title: "Classic French Manicure",
        category: "Manicure",
        imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Gel Art Design",
        category: "Nail Art",
        imageUrl: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Summer Pedicure",
        category: "Pedicure",
        imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 4,
        title: "Abstract Nail Art",
        category: "Nail Art",
        imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 5,
        title: "Pink Glitter Nails",
        category: "Acrylic",
        imageUrl: "https://images.unsplash.com/photo-1601612628452-9e99ced43524?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 6,
        title: "Natural Look Manicure",
        category: "Manicure",
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 7,
        title: "Red Glamour",
        category: "Gel",
        imageUrl: "https://images.unsplash.com/photo-1635368376522-99312d7fa8b2?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 8,
        title: "Floral Designs",
        category: "Nail Art",
        imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=500&h=500&auto=format&fit=crop",
    },
    {
        id: 9,
        title: "Geometric Patterns",
        category: "Nail Art",
        imageUrl: "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=500&h=500&auto=format&fit=crop",
    },
];

// Group images by category
const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
        const category = acc[item.category] || [];
        return { ...acc, [item.category]: [...category, item] };
    }, {});
};

export const metadata = {
    title: "Nail Gallery | Elegant Nails",
    description: "Browse our gallery of nail designs, manicures, pedicures, and nail art.",
};

export default function GalleryPage() {
    const groupedGallery = groupByCategory(galleryItems);
    const categories = Object.keys(groupedGallery);

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary/10 to-background py-20">
                <div className="container max-w-screen-xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Nail Gallery</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Browse our collection of nail designs and get inspired for your next visit.
                        Our talented nail technicians can recreate these designs or customize something unique for you.
                    </p>
                </div>
            </section>

            {/* Gallery Navigation */}
            <section className="py-8 border-b">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="flex overflow-x-auto pb-2 gap-2 justify-center">
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-full">
                            All Designs
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                className="px-4 py-2 bg-muted hover:bg-primary/20 rounded-full whitespace-nowrap"
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-12 md:py-16">
                <div className="container max-w-screen-xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {galleryItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden group">
                                <CardContent className="p-0">
                                    <div className="relative h-72 w-full">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                            <div className="p-4 text-white">
                                                <h3 className="text-lg font-medium">{item.title}</h3>
                                                <p className="text-sm opacity-80">{item.category}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-muted/30">
                <div className="container max-w-screen-xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Love What You See?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">
                        Book an appointment today and let our skilled nail technicians bring your nail vision to life.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="/book"
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                        >
                            Book Appointment
                        </a>
                        <a
                            href="/contact"
                            className="px-6 py-3 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </MainLayout>
    );
} 