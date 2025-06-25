import { MainLayout } from "@/app/components/MainLayout";
import { BookingForm } from "@/app/components/booking/BookingForm";

export const metadata = {
    title: "Book an Appointment | Elegant Nails",
    description: "Book your nail appointment at Elegant Nails. Choose your service, select your preferred date and time, and complete your booking.",
};

export default function BookPage() {
    return (
        <MainLayout>
            <div className="container max-w-screen-lg mx-auto px-4 py-16 md:py-24">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold mb-4">Book Your Appointment</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Choose your preferred service, select a date and time, and provide your details to book your appointment with us.
                    </p>
                </div>

                <div className="bg-card border rounded-lg shadow-sm">
                    <BookingForm />
                </div>
            </div>
        </MainLayout>
    );
} 