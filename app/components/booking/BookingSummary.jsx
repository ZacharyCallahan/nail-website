"use client";

import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, Check, Clock, CreditCard, User } from "lucide-react";

export function BookingSummary({ bookingData, onSubmit }) {
    // Calculate total price
    const calculateTotal = () => {
        let total = 0;

        // Add service price
        if (bookingData.service) {
            const servicePrice = parseFloat(bookingData.service.price.replace(/[^0-9.-]+/g, ""));
            if (!isNaN(servicePrice)) {
                total += servicePrice;
            }
        }

        // Add add-on prices
        if (bookingData.addOns && bookingData.addOns.length > 0) {
            bookingData.addOns.forEach(addOn => {
                const addOnPrice = parseFloat(addOn.price.replace(/[^0-9.-]+/g, ""));
                if (!isNaN(addOnPrice)) {
                    total += addOnPrice;
                }
            });
        }

        return total;
    };

    const total = calculateTotal();

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Review Your Booking</h2>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Service */}
                            {bookingData.service && (
                                <div className="flex flex-col">
                                    <h3 className="font-medium">Selected Service</h3>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex items-center">
                                            <div>
                                                <p>{bookingData.service.title}</p>
                                                <p className="text-xs text-muted-foreground">{bookingData.service.duration}</p>
                                            </div>
                                        </div>
                                        <span className="text-primary">{bookingData.service.price}</span>
                                    </div>
                                </div>
                            )}

                            {/* Add-ons */}
                            {bookingData.addOns && bookingData.addOns.length > 0 && (
                                <div className="flex flex-col pt-4 border-t">
                                    <h3 className="font-medium">Add-ons</h3>
                                    <div className="space-y-2 mt-1">
                                        {bookingData.addOns.map(addOn => (
                                            <div key={addOn.id} className="flex justify-between items-center">
                                                <div>
                                                    <p>{addOn.title}</p>
                                                    <p className="text-xs text-muted-foreground">{addOn.duration}</p>
                                                </div>
                                                <span className="text-primary">{addOn.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Date & Time */}
                            {bookingData.date && bookingData.time && (
                                <div className="flex flex-col pt-4 border-t">
                                    <h3 className="font-medium">Appointment Time</h3>
                                    <div className="flex items-center mt-1 gap-6">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span>{format(bookingData.date, "EEEE, MMMM d, yyyy")}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span>{bookingData.time.time}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Staff */}
                            {bookingData.staffMember && (
                                <div className="flex items-center pt-4 border-t">
                                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-medium">{bookingData.staffMember.name}</h3>
                                        <p className="text-xs text-muted-foreground">{bookingData.staffMember.role}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between bg-muted/50 border-t">
                            <h3 className="font-semibold">Total</h3>
                            <span className="font-semibold text-primary">{formatCurrency(total)}</span>
                        </CardFooter>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                                    <p>{bookingData.firstName}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                                    <p>{bookingData.lastName}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                                <p>{bookingData.email}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                                <p>{bookingData.phone}</p>
                            </div>

                            {bookingData.notes && (
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground">Special Requests/Notes</h3>
                                    <p className="text-sm">{bookingData.notes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    A deposit of $10 will be charged to secure your booking. The remaining balance will be paid at the salon.
                                </p>

                                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm">Payment will be handled securely through Stripe.</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6">
                        <Button onClick={onSubmit} className="w-full" size="lg">
                            <Check className="mr-2 h-4 w-4" /> Confirm Booking
                        </Button>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                            By confirming, you agree to our booking <a href="/terms" className="underline">terms and conditions</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 