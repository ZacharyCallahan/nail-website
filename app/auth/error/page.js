import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Authentication Error | Elegant Nails",
    description: "An error occurred during authentication.",
};

export default function AuthErrorPage({ searchParams }) {
    const { error } = searchParams;

    // Map error codes to user-friendly messages
    const errorMessages = {
        Configuration: "There is a problem with the server configuration. Please contact support.",
        AccessDenied: "You do not have permission to access this resource.",
        Verification: "The verification link is invalid or has expired.",
        Default: "An unexpected authentication error occurred.",
    };

    const errorMessage = errorMessages[error] || errorMessages.Default;

    return (
        <MainLayout>
            <div className="container max-w-md mx-auto py-16 px-4">
                <Card className="border-red-200">
                    <CardContent className="pt-6 text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="h-16 w-16 text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Authentication Error</h1>
                        <p className="text-muted-foreground mb-6">
                            {errorMessage}
                        </p>

                        <div className="space-y-4">
                            <p>
                                Please try signing in again or contact support if the issue persists.
                            </p>

                            <div className="flex flex-col md:flex-row justify-center gap-4 pt-4">
                                <Button asChild>
                                    <Link href="/auth/signin">Try Again</Link>
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