import SignUpForm from "@/app/components/auth/SignUpForm";
import { MainLayout } from "@/app/components/MainLayout";
import Link from "next/link";

export const metadata = {
    title: "Sign Up | Elegant Nails",
    description: "Create an account with Elegant Nails to book appointments, get special offers, and more.",
};

export default function SignUpPage() {
    return (
        <MainLayout>
            <div className="container max-w-md mx-auto py-16 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create an Account</h1>
                    <p className="text-muted-foreground">
                        Join Elegant Nails to book appointments online and manage your profile
                    </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <SignUpForm />

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/auth/signin" className="text-primary font-medium hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
} 