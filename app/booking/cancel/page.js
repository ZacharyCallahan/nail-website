import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Booking Cancelled | Elegant Nails",
    description: "Your appointment booking has been cancelled. You can restart the booking process at any time.",
};

export default function BookingCancelPage() {
    return (
        <MainLayout>
            <div className="container max-w-lg mx-auto px-4 py-16 md:py-32">
                <div className="text-center">
                    <div className="rounded-full h-20 w-20 bg-orange-100 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-orange-600" />
                    </div>

                    <h1 className="text-3xl font-bold mb-4">Booking Cancelled</h1>

                    <div className="bg-card border rounded-lg p-6 mb-8">
                        <p className="text-center mb-6">
                            Your booking was not completed. No payment has been processed.
                        </p>

                        <div className="space-y-4 text-left">
                            <p className="text-muted-foreground">
                                You may have cancelled the payment process, or there might have been an issue with the payment.
                            </p>

                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Need assistance with your booking?
                                </p>
                                <p className="text-sm">
                                    Please call us at <a href="tel:+1234567890" className="text-primary font-medium underline">123-456-7890</a> or email us at <a href="mailto:contact@elegantnails.com" className="text-primary font-medium underline">contact@elegantnails.com</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild>
                            <Link href="/book">Try Booking Again</Link>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 