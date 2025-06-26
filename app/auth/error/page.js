import { MainLayout } from "@/app/components/MainLayout";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Authentication Error | Elegant Nails",
    description: "An error occurred during authentication.",
};

export default async function AuthErrorPage({ searchParams }) {
    // Use await to access searchParams properties
    const params = await searchParams;
    const errorType = await params?.error || "Default";
    const errorMsg = await params?.message || null;

    // Map error codes to user-friendly messages
    const errorMessages = {
        Configuration: "There is a problem with the server configuration. Please contact support.",
        AccessDenied: "You do not have permission to access this resource.",
        Verification: "The verification link is invalid or has expired.",
        CredentialsSignin: "Login failed. Please check your email and password and try again.",
        Default: "An unexpected authentication error occurred.",
    };

    const errorMessage = errorMessages[errorType] || errorMessages.Default;
    const detailedMessage = errorMsg ? decodeURIComponent(errorMsg) : null;

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

                        {detailedMessage && (
                            <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
                                <p className="text-sm font-medium text-red-800 mb-1">Error details:</p>
                                <p className="text-sm text-red-700">{detailedMessage}</p>
                            </div>
                        )}

                        {errorType && errorType !== "Default" && (
                            <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
                                <p className="text-sm font-medium text-gray-800 mb-1">Error code:</p>
                                <p className="text-sm text-gray-700">{errorType}</p>
                            </div>
                        )}

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