import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Booking Cancelled | Elegant Nails",
    description: "Your nail appointment booking has been cancelled.",
};

export default function BookingCancelPage() {
    return (
        <MainLayout>
            <div className="container max-w-screen-md mx-auto py-16 px-4">
                <Card className="border-red-200">
                    <CardContent className="pt-6 text-center">
                        <div className="flex justify-center mb-4">
                            <XCircle className="h-16 w-16 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Booking Cancelled</h1>
                        <p className="text-muted-foreground mb-6">
                            Your appointment booking has been cancelled and no payment has been processed.
                        </p>

                        <div className="space-y-4">
                            <p>
                                If you encountered any issues during the booking process, please contact us for assistance.
                                You can also try booking again at a more convenient time.
                            </p>

                            <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
                                <Button asChild>
                                    <Link href="/book">Try Again</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/">Return to Home</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
} 