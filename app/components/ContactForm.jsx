"use client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // This would be replaced with a real API call
            // For now we'll simulate a network request
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset form on success
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: ""
            });
            setIsSubmitted(true);

            // Reset success message after 5 seconds
            setTimeout(() => {
                setIsSubmitted(false);
            }, 5000);
        } catch (err) {
            setError("Something went wrong. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Jane Smith"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        name="subject"
                        placeholder="Appointment Inquiry"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Please provide any details about your inquiry..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                />
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {isSubmitted && (
                <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                    Thank you for your message! We'll get back to you as soon as possible.
                </div>
            )}

            <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isSubmitting || isSubmitted}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : "Send Message"}
            </Button>
        </form>
    );
} 