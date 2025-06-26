"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { AlertCircle, Calendar, Check, CheckCircle, Clock, CreditCard, Loader2, User } from "lucide-react";
import { useState } from "react";

export function BookingSummary({ bookingData, onSubmit }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Calculate total price
    const calculateTotal = () => {
        let total = 0;

        // Add service price
        if (bookingData.service) {
            total += parseFloat(bookingData.service.price);
        }

        // Add add-ons prices
        if (bookingData.addOns && bookingData.addOns.length > 0) {
            total += bookingData.addOns.reduce((sum, addon) =>
                sum + parseFloat(addon.price), 0);
        }

        return total;
    };

    const totalPrice = calculateTotal();

    const handleBookingSubmit = async () => {
        try {
            setIsSubmitting(true);
            setError(null);

            const payload = {
                serviceId: bookingData.service.id,
                staffId: bookingData.staffMember.id,
                startTime: bookingData.time.time,
                totalPrice: totalPrice,
                addOns: bookingData.addOns ? bookingData.addOns.map(addon => addon.id) : [],
                customerFirstName: bookingData.firstName,
                customerLastName: bookingData.lastName,
                customerEmail: bookingData.email,
                customerPhone: bookingData.phone,
                notes: bookingData.notes
            };

            const response = await fetch('/api/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create booking');
            }

            const data = await response.json();

            setSuccess(true);

            // Store booking reference for confirmation
            localStorage.setItem('lastBookingId', data.appointmentId);

            // Redirect to Stripe checkout
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            }

        } catch (err) {
            console.error("Error submitting booking:", err);
            setError(err.message || "Failed to complete your booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!bookingData.service || !bookingData.staffMember || !bookingData.date || !bookingData.time) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-2">Incomplete Booking Information</h3>
                <p className="text-muted-foreground mb-4">
                    Please go back and complete all required fields.
                </p>
                <Button onClick={() => window.history.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-2">Processing Your Booking</h3>
                <p className="text-muted-foreground mb-2">
                    Redirecting to secure payment...
                </p>
                <div className="mx-auto flex justify-center mt-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            <div>
                <h3 className="text-lg font-medium mb-4">Booking Summary</h3>

                <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-3 border-b">
                        <div className="p-4 border-r">
                            <div className="text-sm text-muted-foreground mb-1">Service</div>
                            <div className="font-medium">{bookingData.service.name}</div>
                            <div className="text-sm">{bookingData.service.duration} min</div>
                        </div>

                        <div className="p-4 border-r">
                            <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                            <div className="font-medium">{formatDate(bookingData.date)}</div>
                            <div className="text-sm">{formatTime(bookingData.time.time)}</div>
                        </div>

                        <div className="p-4">
                            <div className="text-sm text-muted-foreground mb-1">Staff</div>
                            <div className="font-medium">{bookingData.staffMember.name}</div>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="border-b p-4">
                        <div className="text-sm text-muted-foreground mb-1">Customer</div>
                        <div className="font-medium">
                            {bookingData.firstName} {bookingData.lastName}
                        </div>
                        <div className="text-sm">{bookingData.email}</div>
                        <div className="text-sm">{bookingData.phone}</div>
                    </div>

                    {/* Price Details */}
                    <div className="p-4 space-y-2">
                        <div className="flex justify-between">
                            <span>{bookingData.service.name}</span>
                            <span>{formatCurrency(bookingData.service.price)}</span>
                        </div>

                        {bookingData.addOns && bookingData.addOns.length > 0 && (
                            bookingData.addOns.map(addon => (
                                <div key={addon.id} className="flex justify-between text-sm">
                                    <span>{addon.name}</span>
                                    <span>{formatCurrency(addon.price)}</span>
                                </div>
                            ))
                        )}

                        <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                            <span>Total</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                </div>

                {bookingData.notes && (
                    <div className="mt-4">
                        <div className="text-sm text-muted-foreground mb-1">Notes</div>
                        <div className="p-3 bg-muted/50 rounded-md">{bookingData.notes}</div>
                    </div>
                )}
            </div>

            <div className="pt-4 flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                    By completing this booking, you agree to our
                    <a href="#" className="text-primary hover:underline mx-1">Terms of Service</a>
                    and
                    <a href="#" className="text-primary hover:underline mx-1">Cancellation Policy</a>.
                </p>

                <Button
                    onClick={handleBookingSubmit}
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Complete Booking & Pay Now"
                    )}
                </Button>
            </div>
        </div>
    );
} 