import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Booking Confirmed | Elegant Nails",
    description: "Your nail appointment has been confirmed successfully.",
};

export default function BookingSuccessPage({ searchParams }) {
    const { session_id } = searchParams;

    return (
        <MainLayout>
            <div className="container max-w-screen-md mx-auto py-16 px-4">
                <Card className="border-green-200">
                    <CardContent className="pt-6 text-center">
                        <div className="flex justify-center mb-4">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                        <p className="text-muted-foreground mb-6">
                            Your appointment has been successfully booked and payment has been processed.
                        </p>

                        {session_id && (
                            <div className="mb-6 p-4 bg-muted/30 rounded-md">
                                <p className="text-sm">Transaction ID: <span className="font-medium">{session_id}</span></p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Please save this for your reference. A confirmation email has also been sent to your email address.
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p>
                                We look forward to seeing you at your scheduled appointment time.
                                If you need to make any changes, please contact us at least 24 hours in advance.
                            </p>

                            <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
                                <Button asChild>
                                    <Link href="/appointments">View My Appointments</Link>
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