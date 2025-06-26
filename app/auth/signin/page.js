import SignInForm from "@/app/components/auth/SignInForm";
import { MainLayout } from "@/app/components/MainLayout";
import Link from "next/link";

export const metadata = {
    title: "Sign In | Elegant Nails",
    description: "Sign in to your Elegant Nails account to book appointments, view your history, and more.",
};

export default function SignInPage() {
    return (
        <MainLayout>
            <div className="container max-w-md mx-auto py-16 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">
                        Sign in to your account to manage appointments and more
                    </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <SignInForm />

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link href="/auth/signup" className="text-primary font-medium hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 