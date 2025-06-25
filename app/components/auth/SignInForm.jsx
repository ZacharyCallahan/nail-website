"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
                return;
            }

            // Redirect to dashboard or home page
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Sign in error:", error);
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:underline"
                    >
                        Forgot password?
                    </a>
                </div>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    "Sign In"
                )}
            </Button>
        </form>
    );
} 