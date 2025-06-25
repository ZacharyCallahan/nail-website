"use client";

import { Button } from "@/app/components/ui/button";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookingSummary } from "./BookingSummary";
import { CustomerDetails } from "./CustomerDetails";
import { DateTimeSelection } from "./DateTimeSelection";
import { ServiceSelection } from "./ServiceSelection";

const steps = [
    { id: "service", title: "Select Service" },
    { id: "datetime", title: "Choose Date & Time" },
    { id: "details", title: "Your Details" },
    { id: "summary", title: "Review & Confirm" },
];

export function BookingForm() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [bookingData, setBookingData] = useState({
        service: null,
        addOns: [],
        staffMember: null,
        date: null,
        time: null,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: "",
    });

    // Use URL parameters to pre-select service if available
    useEffect(() => {
        const serviceId = searchParams.get("service");
        if (serviceId) {
            // In a real app, you would fetch the service details from the API
            // For now, we'll just set a placeholder value
            setBookingData(prev => ({
                ...prev,
                service: {
                    id: serviceId,
                    title: "Selected Service",
                    price: "$0.00",
                    duration: "0 min"
                }
            }));
        }
    }, [searchParams]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleServiceSelection = (service) => {
        setBookingData({ ...bookingData, service });
    };

    const handleAddOns = (addOns) => {
        setBookingData({ ...bookingData, addOns });
    };

    const handleStaffSelection = (staffMember) => {
        setBookingData({ ...bookingData, staffMember });
    };

    const handleDateSelection = (date) => {
        setBookingData({ ...bookingData, date });
    };

    const handleTimeSelection = (time) => {
        setBookingData({ ...bookingData, time });
    };

    const handleCustomerDetails = (details) => {
        setBookingData({ ...bookingData, ...details });
    };

    const handleSubmit = async () => {
        // In a real app, you would submit the booking data to the API
        console.log("Submitting booking:", bookingData);

        // Placeholder for API call
        try {
            // await createBooking(bookingData);
            alert("Thank you for your booking! We'll see you soon.");
            // Redirect to confirmation page or reset form
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("There was an error processing your booking. Please try again.");
        }
    };

    const isStepComplete = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return !!bookingData.service;
            case 1:
                return !!bookingData.date && !!bookingData.time;
            case 2:
                return !!bookingData.firstName && !!bookingData.lastName && !!bookingData.email && !!bookingData.phone;
            default:
                return false;
        }
    };

    const canProceed = isStepComplete(currentStep);

    return (
        <div className="p-6">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`flex items-center justify-center h-8 w-8 rounded-full ${index <= currentStep
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground"
                                    } ${index < currentStep && "bg-primary"}`}
                            >
                                {index < currentStep ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span>{index + 1}</span>
                                )}
                            </div>
                            <span
                                className={`ml-2 hidden sm:block ${index <= currentStep ? "text-foreground font-medium" : "text-muted-foreground"
                                    }`}
                            >
                                {step.title}
                            </span>
                            {index < steps.length - 1 && (
                                <div className="hidden sm:block mx-4 h-0.5 w-10 bg-muted"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="py-6">
                {currentStep === 0 && (
                    <ServiceSelection
                        selectedService={bookingData.service}
                        selectedAddOns={bookingData.addOns}
                        onServiceSelect={handleServiceSelection}
                        onAddOnsChange={handleAddOns}
                    />
                )}

                {currentStep === 1 && (
                    <DateTimeSelection
                        selectedDate={bookingData.date}
                        selectedTime={bookingData.time}
                        selectedStaff={bookingData.staffMember}
                        onDateSelect={handleDateSelection}
                        onTimeSelect={handleTimeSelection}
                        onStaffSelect={handleStaffSelection}
                    />
                )}

                {currentStep === 2 && (
                    <CustomerDetails
                        customerData={{
                            firstName: bookingData.firstName,
                            lastName: bookingData.lastName,
                            email: bookingData.email,
                            phone: bookingData.phone,
                            notes: bookingData.notes
                        }}
                        onDetailsChange={handleCustomerDetails}
                    />
                )}

                {currentStep === 3 && (
                    <BookingSummary
                        bookingData={bookingData}
                        onSubmit={handleSubmit}
                    />
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="flex items-center"
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                {currentStep < steps.length - 1 ? (
                    <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="flex items-center"
                    >
                        Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        className="flex items-center"
                    >
                        Complete Booking <Check className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
} 