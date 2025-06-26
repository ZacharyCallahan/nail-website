import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Booking Confirmed | Elegant Nails",
    description: "Your appointment has been confirmed at Elegant Nails. We look forward to seeing you!",
};

export default function BookingSuccessPage() {
    return (
        <MainLayout>
            <div className="container max-w-lg mx-auto px-4 py-16 md:py-32">
                <div className="text-center">
                    <div className="rounded-full h-20 w-20 bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>

                    <div className="bg-card border rounded-lg p-6 mb-8 text-left">
                        <p className="text-center text-muted-foreground mb-6">
                            Thank you for booking with Elegant Nails. We&apos;ve sent a confirmation email with all the details.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Appointment ID</h3>
                                <p id="appointment-id" className="font-medium">—</p>
                            </div>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Need to make changes to your appointment?
                                </p>
                                <p className="text-sm">
                                    Please call us at <a href="tel:+1234567890" className="text-primary font-medium underline">123-456-7890</a> or email us at <a href="mailto:contact@elegantnails.com" className="text-primary font-medium underline">contact@elegantnails.com</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild variant="outline">
                            <Link href="/book">Book Another Appointment</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Client-side script to display the appointment ID from URL parameter or localStorage */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
                        document.addEventListener('DOMContentLoaded', function() {
                            const urlParams = new URLSearchParams(window.location.search);
                            const appointmentId = urlParams.get('appointmentId') || localStorage.getItem('lastBookingId') || 'Unknown';
                            document.getElementById('appointment-id').innerText = appointmentId;
                        });
                    `,
                }}
            />
        </MainLayout>
    );
} 