"use client";

import { Button } from "@/app/components/ui/button";
import { addDays } from "date-fns";
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

    // Break out service into its own state for more direct control
    const [selectedService, setSelectedService] = useState(null);

    const [bookingData, setBookingData] = useState({
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

    // Add state for validation errors
    const [validationErrors, setValidationErrors] = useState({});

    // Load any previously saved booking data from localStorage
    useEffect(() => {
        try {
            // Try to load selected service from localStorage
            const savedServiceJson = localStorage.getItem('selectedService');
            if (savedServiceJson) {
                const savedService = JSON.parse(savedServiceJson);
                console.log("Loaded saved service from localStorage:", savedService);
                setSelectedService(savedService);
            }

            // Try to load booking data from localStorage
            const savedBookingDataJson = localStorage.getItem('bookingData');
            if (savedBookingDataJson) {
                const savedBookingData = JSON.parse(savedBookingDataJson);
                console.log("Loaded saved booking data from localStorage:", savedBookingData);

                // Convert ISO date string back to Date object if needed
                if (savedBookingData.date && typeof savedBookingData.date === 'string') {
                    savedBookingData.date = new Date(savedBookingData.date);
                    console.log("Converted date string to Date object:", savedBookingData.date);
                }

                // Only update state if we have actual data
                if (Object.keys(savedBookingData).length > 0) {
                    console.log("Updating booking data from localStorage");
                    setBookingData(prev => ({
                        ...prev,
                        ...savedBookingData
                    }));
                }
            }
        } catch (e) {
            console.error("Error loading saved booking data:", e);
        }
    }, []);

    // Use URL parameters to pre-select service if available
    useEffect(() => {
        const serviceId = searchParams.get("service");
        if (serviceId && !selectedService) {
            // Fetch the service details from the API
            const fetchService = async () => {
                try {
                    const response = await fetch(`/api/services?serviceId=${serviceId}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.service) {
                            console.log("Fetched service from API:", data.service);
                            setSelectedService(data.service);

                            // Store in localStorage
                            localStorage.setItem('selectedService', JSON.stringify(data.service));

                            // Also update bookingData
                            const updatedBookingData = {
                                ...bookingData,
                                service: data.service
                            };
                            setBookingData(updatedBookingData);
                            localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching service details:", error);
                }
            };

            fetchService();
        }
    }, [searchParams, selectedService, bookingData]);

    // Initialize local state with reasonable defaults - only if no date exists
    useEffect(() => {
        // Check if we already have a date from localStorage or props
        const hasDate = bookingData.date !== null && bookingData.date !== undefined;
        console.log("Date initialization check - has date:", hasDate);

        // Only initialize if we don't have a date
        if (!hasDate) {
            try {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                console.log("Initializing with default date (tomorrow):", tomorrow);

                // Update the booking data directly
                setBookingData(prev => ({
                    ...prev,
                    date: tomorrow
                }));

                // Also update localStorage
                try {
                    const currentData = JSON.parse(localStorage.getItem('bookingData') || '{}');
                    const updatedData = {
                        ...currentData,
                        date: tomorrow.toISOString()
                    };
                    localStorage.setItem('bookingData', JSON.stringify(updatedData));
                    console.log("Saved initial date to localStorage");
                } catch (e) {
                    console.error("Error saving initial date to localStorage:", e);
                }
            } catch (error) {
                console.error("Error initializing default date:", error);
            }
        } else {
            console.log("Date already exists, not initializing default");
        }
    }, []); // Empty dependency array - only run once on mount

    // Ensure staff data is properly loaded and processed
    useEffect(() => {
        // Check if we have staff data in localStorage but not in state
        try {
            const savedBookingDataJson = localStorage.getItem('bookingData');
            if (savedBookingDataJson) {
                const savedBookingData = JSON.parse(savedBookingDataJson);

                // If there's staff data in localStorage but not in state, update state
                if (savedBookingData.staffMember &&
                    (!bookingData.staffMember ||
                        bookingData.staffMember.id !== savedBookingData.staffMember.id)) {

                    console.log("Found staff in localStorage but not in state, updating:",
                        savedBookingData.staffMember);

                    // Create a clean staff object
                    const cleanStaff = {
                        id: savedBookingData.staffMember.id,
                        name: savedBookingData.staffMember.name || "Staff Member",
                        image: savedBookingData.staffMember.image || null
                    };

                    // Update state
                    setBookingData(prev => ({
                        ...prev,
                        staffMember: cleanStaff
                    }));

                    console.log("Staff loaded from localStorage:", cleanStaff);
                }
            }
        } catch (e) {
            console.error("Error ensuring staff data:", e);
        }
    }, []);

    const handleNext = () => {
        console.log("handleNext called", {
            currentStep,
            canProceed,
            stepValidation: {
                selectedService: !!selectedService,
                hasDate: !!bookingData.date,
                hasTime: !!bookingData.time,
                hasStaff: !!bookingData.staffMember
            }
        });

        // Check validation for current step and set appropriate errors
        let errors = {};

        if (currentStep === 0) {
            if (!selectedService) {
                errors.service = "Please select a service";
            }
        } else if (currentStep === 1) {
            if (!bookingData.date) {
                errors.date = "Please select a date";
            }
            if (!bookingData.staffMember) {
                errors.staff = "Please select a staff member";
            }
            if (!bookingData.time) {
                errors.time = "Please select a time slot";
            } else if (typeof bookingData.time === 'object' && !bookingData.time.time) {
                errors.time = "Invalid time selection";
            }
        } else if (currentStep === 2) {
            // Customer details validation handled by the form
        }

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            console.log("Validation failed:", errors);
            return; // Don't proceed if there are validation errors
        }

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
        console.log("Service selection in BookingForm:", service);

        if (!service || !service.id) {
            console.error("Invalid service object received:", service);
            return;
        }

        // Directly update the service state
        setSelectedService(service);

        // Store in local storage for persistence across page refreshes
        try {
            localStorage.setItem('selectedService', JSON.stringify(service));
            console.log("Saved to localStorage:", service);

            // Update bookingData with the selected service
            const updatedBookingData = {
                ...bookingData,
                service: service
            };
            setBookingData(updatedBookingData);
            localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    };

    const handleAddOns = (addOns) => {
        const updatedBookingData = { ...bookingData, addOns };
        setBookingData(updatedBookingData);

        // Update localStorage
        try {
            localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
        } catch (e) {
            console.error('Error saving addOns to localStorage:', e);
        }
    };

    // Add a debug function to manually set staff
    const forceSetStaff = (staffMember) => {
        if (!staffMember) return;

        console.log("Force setting staff in BookingForm:", staffMember);

        // Update state directly
        setBookingData(prev => ({
            ...prev,
            staffMember: staffMember
        }));

        // Also update localStorage
        try {
            const serializableData = {
                ...bookingData,
                staffMember: staffMember
            };
            localStorage.setItem('bookingData', JSON.stringify(serializableData));
            console.log("Saved staff to localStorage");
        } catch (e) {
            console.error('Error saving staff to localStorage:', e);
        }
    };

    const handleStaffSelection = (staffMember) => {
        console.log("Staff selected in BookingForm:", staffMember);

        if (!staffMember) {
            console.log("Clearing staff selection");
            const updatedBookingData = { ...bookingData, staffMember: null };
            setBookingData(updatedBookingData);

            // Update localStorage
            try {
                localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
            } catch (e) {
                console.error('Error saving staffMember to localStorage:', e);
            }
            return;
        }

        // Validate staff object
        if (!staffMember.id) {
            console.error("Invalid staff object received - missing ID:", staffMember);
            return;
        }

        // Create a clean staff object to ensure it can be serialized
        const cleanStaffMember = {
            id: staffMember.id,
            name: staffMember.name || "Staff Member",
            image: staffMember.image || null
        };

        console.log("Updating booking data with staff:", cleanStaffMember);

        // IMPORTANT: Use a callback form of setState to ensure we're working with the latest state
        setBookingData(prevData => {
            const updatedData = {
                ...prevData,
                staffMember: cleanStaffMember
            };

            console.log("Updated booking data:", updatedData);

            // Update localStorage inside the callback to ensure we're saving the latest state
            try {
                localStorage.setItem('bookingData', JSON.stringify(updatedData));
                console.log("Staff saved to localStorage");
            } catch (e) {
                console.error('Error saving staffMember to localStorage:', e);
            }

            return updatedData;
        });

        // Force a re-render to ensure the UI updates
        setTimeout(() => {
            console.log("Current booking data after staff update:", bookingData);
        }, 10);

        // Add a confirmation alert for debugging
        alert(`Staff selected in BookingForm: ${cleanStaffMember.name} (ID: ${cleanStaffMember.id})`);
    };

    // Add a direct debug function to manually set the date
    const forceSetDate = (date) => {
        if (!date) return;

        const dateObj = new Date(date);
        console.log("Force setting date in BookingForm:", dateObj.toISOString());

        // Update state directly
        setBookingData(prev => ({
            ...prev,
            date: dateObj
        }));

        // Also update localStorage
        const serializableData = {
            ...bookingData,
            date: dateObj.toISOString()
        };
        localStorage.setItem('bookingData', JSON.stringify(serializableData));

        // Force re-render
        setTimeout(() => setCurrentStep(currentStep), 0);
    };

    const handleDateSelection = (date) => {
        console.log("Date selected in BookingForm:", date);

        // Make sure we have a valid date
        if (!date) {
            console.error("Invalid date received in handleDateSelection");
            return;
        }

        try {
            // Ensure it's a proper Date object
            let dateObj;
            if (!(date instanceof Date)) {
                console.log("Converting date to Date object");
                dateObj = new Date(date);
            } else {
                dateObj = date;
            }

            // Validate before saving
            if (isNaN(dateObj.getTime())) {
                console.error("Invalid date object:", dateObj);
                return;
            }

            // Check if date actually changed
            const currentDateString = bookingData.date ?
                (bookingData.date instanceof Date ?
                    bookingData.date.toDateString() :
                    new Date(bookingData.date).toDateString()) :
                null;
            const newDateString = dateObj.toDateString();

            if (currentDateString === newDateString) {
                console.log("Date unchanged, not updating state");
                return;
            }

            console.log(`Date changed from ${currentDateString} to ${newDateString}`);

            // IMPORTANT: Update state immediately with the new date
            setBookingData(prev => {
                const updated = {
                    ...prev,
                    date: dateObj
                };

                // Update localStorage immediately after state update
                try {
                    const serializableData = {
                        ...updated,
                        date: dateObj.toISOString()
                    };
                    localStorage.setItem('bookingData', JSON.stringify(serializableData));
                    console.log("Saved date to localStorage:", serializableData.date);
                } catch (e) {
                    console.error('Error saving date to localStorage:', e);
                }

                return updated;
            });

            // Log confirmation
            console.log("Date selection complete - new date set to:", dateObj.toDateString());
        } catch (error) {
            console.error("Error in handleDateSelection:", error);
        }
    };

    const handleTimeSelection = (time) => {
        console.log("Time selected in BookingForm:", time);

        // Handle null time (used when resetting selections)
        if (!time) {
            console.log("Clearing time selection");
            const updatedBookingData = { ...bookingData, time: null };
            setBookingData(updatedBookingData);

            // Update localStorage
            try {
                localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
                console.log("Cleared time in localStorage");
            } catch (e) {
                console.error('Error updating localStorage:', e);
            }
            return;
        }

        // Log the exact structure of the time object
        console.log("Time object structure:", {
            isObject: typeof time === 'object',
            hasTimeProperty: time && typeof time === 'object' && 'time' in time,
            timeValue: time && typeof time === 'object' && time.time,
            rawTime: time
        });

        // Ensure time has the expected structure for validation
        const updatedBookingData = { ...bookingData, time };
        console.log("Updated booking data with time:", updatedBookingData);

        setBookingData(updatedBookingData);

        // Update localStorage
        try {
            localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
            console.log("Saved time to localStorage. Updated bookingData:", updatedBookingData);
        } catch (e) {
            console.error('Error saving time to localStorage:', e);
        }
    };

    const handleCustomerDetails = (details) => {
        const updatedBookingData = { ...bookingData, ...details };
        setBookingData(updatedBookingData);

        // Update localStorage
        try {
            localStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
        } catch (e) {
            console.error('Error saving customer details to localStorage:', e);
        }
    };

    const handleSubmit = async () => {
        // Combine data for submission
        const finalData = {
            ...bookingData,
            service: selectedService
        };

        console.log("Submitting booking:", finalData);

        // Placeholder for API call
        try {
            // await createBooking(finalData);
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
                return !!selectedService;
            case 1:
                // Better date validation - ensure it's a valid Date object or date string
                let hasDate = false;
                if (bookingData.date) {
                    if (bookingData.date instanceof Date) {
                        hasDate = !isNaN(bookingData.date.getTime());
                    } else if (typeof bookingData.date === 'string') {
                        const dateObj = new Date(bookingData.date);
                        hasDate = !isNaN(dateObj.getTime());
                    }
                }

                // Enhanced check for time selection
                let hasTime = false;
                if (bookingData.time) {
                    if (typeof bookingData.time === 'object') {
                        hasTime = !!bookingData.time.time;
                    } else {
                        hasTime = true;  // direct value
                    }
                }

                // Enhanced check for staff selection
                let hasStaff = false;
                if (bookingData.staffMember) {
                    // Check if staffMember is an object with an id
                    hasStaff = typeof bookingData.staffMember === 'object' &&
                        !!bookingData.staffMember.id;

                    console.log("Staff validation details:", {
                        staffMember: bookingData.staffMember,
                        hasId: !!bookingData.staffMember.id,
                        isObject: typeof bookingData.staffMember === 'object'
                    });
                }

                // For step 1, both staff and time must be selected along with the date
                console.log("STEP 1 VALIDATION DETAILS:", {
                    hasDate,
                    hasTime,
                    hasStaff,
                    date: bookingData.date instanceof Date ? bookingData.date.toISOString() : bookingData.date,
                    time: bookingData.time,
                    timeValue: bookingData.time ? bookingData.time.time : null,
                    staffMember: bookingData.staffMember,
                    staffId: bookingData.staffMember ? bookingData.staffMember.id : null
                });

                const canProceed = hasDate && hasTime && hasStaff;
                console.log("Can proceed to next step:", canProceed);
                return canProceed;
            case 2:
                return !!bookingData.firstName && !!bookingData.lastName && !!bookingData.email && !!bookingData.phone;
            default:
                return false;
        }
    };

    const canProceed = isStepComplete(currentStep);

    useEffect(() => {
        // Log the current state for debugging
        console.log("Current step:", currentStep);
        console.log("Selected service:", selectedService);
        console.log("Can proceed:", canProceed);
    }, [currentStep, selectedService, canProceed]);

    // Direct test function to update staff
    const directUpdateStaff = () => {
        // Create a test staff member
        const testStaff = {
            id: "direct-test-staff",
            name: "Direct Test Staff",
            image: null
        };

        // Update state directly
        setBookingData(prevData => {
            const updatedData = {
                ...prevData,
                staffMember: testStaff
            };

            console.log("Direct staff update - new booking data:", updatedData);

            // Update localStorage
            try {
                localStorage.setItem('bookingData', JSON.stringify(updatedData));
                console.log("Direct staff update saved to localStorage");
            } catch (e) {
                console.error('Error saving direct staff update to localStorage:', e);
            }

            return updatedData;
        });

        // Verify the update
        setTimeout(() => {
            console.log("Verification - current booking data:", bookingData);
            alert(`Direct staff update - Staff: ${bookingData.staffMember?.name || 'Not updated'}`);
        }, 100);
    };

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
                        selectedService={selectedService}
                        selectedAddOns={bookingData.addOns}
                        onServiceSelect={handleServiceSelection}
                        onAddOnsChange={handleAddOns}
                    />
                )}

                {currentStep === 1 && (
                    <>
                        {console.log("Rendering DateTimeSelection with:", {
                            date: bookingData.date,
                            time: bookingData.time,
                            staff: bookingData.staffMember
                        })}

                        {/* Advanced debug panel */}
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm font-medium mb-2">Advanced Debug Tools</p>
                            <div className="text-xs mb-2">
                                <p>Current date in state: {bookingData.date ? new Date(bookingData.date).toLocaleString() : 'None'}</p>
                                <p>Date type: {bookingData.date ? typeof bookingData.date : 'none'}</p>
                                <p>Is Date object: {bookingData.date ? (bookingData.date instanceof Date).toString() : 'n/a'}</p>
                                <p>Staff selected: {bookingData.staffMember ? bookingData.staffMember.name : 'None'}</p>
                                <p>Staff ID: {bookingData.staffMember ? bookingData.staffMember.id : 'None'}</p>
                                <p>Staff object: {bookingData.staffMember ? JSON.stringify(bookingData.staffMember) : 'null'}</p>
                                <p>Time selected: {bookingData.time ? (bookingData.time.time || 'Invalid format') : 'None'}</p>
                                <p>Can proceed: {canProceed ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        forceSetDate(tomorrow);
                                        alert("Date directly set to tomorrow: " + tomorrow.toDateString());
                                    }}
                                >
                                    Force Tomorrow
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        const nextWeek = new Date();
                                        nextWeek.setDate(nextWeek.getDate() + 7);
                                        forceSetDate(nextWeek);
                                        alert("Date directly set to next week: " + nextWeek.toDateString());
                                    }}
                                >
                                    Force Next Week
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        // Create a mock staff member
                                        const mockStaff = {
                                            id: "staff-1",
                                            name: "Debug Staff",
                                            image: null
                                        };
                                        forceSetStaff(mockStaff);
                                        alert("Staff manually set to: " + mockStaff.name);
                                    }}
                                >
                                    Force Staff
                                </Button>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={directUpdateStaff}
                                >
                                    Direct Staff Update
                                </Button>
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        // Check validation
                                        const hasDate = isStepComplete(1);
                                        alert(`Validation check: ${hasDate ? 'PASS' : 'FAIL'}\n\n` +
                                            `Date: ${bookingData.date ? 'YES' : 'NO'}\n` +
                                            `Staff: ${bookingData.staffMember ? 'YES' : 'NO'}\n` +
                                            `Time: ${bookingData.time ? 'YES' : 'NO'}\n\n` +
                                            `Staff details: ${bookingData.staffMember ? JSON.stringify(bookingData.staffMember) : 'none'}`);
                                    }}
                                >
                                    Check Validation
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        // Reload from localStorage
                                        try {
                                            const saved = JSON.parse(localStorage.getItem('bookingData') || '{}');
                                            if (saved.date) {
                                                const dateObj = new Date(saved.date);
                                                setBookingData(prev => ({ ...prev, date: dateObj }));
                                                alert("Reloaded date from localStorage: " + dateObj.toDateString());
                                            } else {
                                                alert("No date found in localStorage");
                                            }
                                        } catch (e) {
                                            alert("Error loading from localStorage: " + e.message);
                                        }
                                    }}
                                >
                                    Reload from Storage
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        // Force next step regardless of validation
                                        if (currentStep < steps.length - 1) {
                                            setCurrentStep(currentStep + 1);
                                            window.scrollTo(0, 0);
                                            alert("Forced next step");
                                        } else {
                                            alert("Already at last step");
                                        }
                                    }}
                                >
                                    Force Next Step
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        // Set all required fields for validation
                                        const tomorrow = new Date();
                                        tomorrow.setDate(tomorrow.getDate() + 1);

                                        // Create mock data
                                        const mockStaff = {
                                            id: "staff-debug",
                                            name: "Debug Staff",
                                            image: null
                                        };

                                        const mockTime = {
                                            time: "10:00:00",
                                            staffId: "staff-debug"
                                        };

                                        // Update all at once
                                        const updatedData = {
                                            ...bookingData,
                                            date: tomorrow,
                                            staffMember: mockStaff,
                                            time: mockTime
                                        };

                                        setBookingData(updatedData);

                                        // Save to localStorage
                                        try {
                                            const serializableData = {
                                                ...updatedData,
                                                date: tomorrow.toISOString()
                                            };
                                            localStorage.setItem('bookingData', JSON.stringify(serializableData));
                                        } catch (e) {
                                            console.error('Error saving to localStorage:', e);
                                        }

                                        alert("All fields set for validation");
                                    }}
                                >
                                    Set All Fields
                                </Button>
                            </div>
                        </div>

                        <DateTimeSelection
                            selectedDate={bookingData.date}
                            selectedTime={bookingData.time}
                            selectedStaff={bookingData.staffMember}
                            onDateSelect={handleDateSelection}
                            onTimeSelect={handleTimeSelection}
                            onStaffSelect={handleStaffSelection}
                        />
                    </>
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
                        bookingData={{
                            ...bookingData,
                            service: selectedService
                        }}
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
                    <div className="flex flex-col items-end">
                        {!canProceed && (
                            <div className="text-sm text-red-500 mb-2">
                                {currentStep === 0 && validationErrors.service}
                                {currentStep === 1 && (
                                    <>
                                        {validationErrors.date && <p>{validationErrors.date}</p>}
                                        {validationErrors.staff && <p>{validationErrors.staff}</p>}
                                        {validationErrors.time && <p>{validationErrors.time}</p>}
                                        {!validationErrors.date && !validationErrors.staff && !validationErrors.time &&
                                            <p>Please complete all selections to continue</p>}
                                    </>
                                )}
                                {currentStep === 2 && "Please fill in all required fields"}
                            </div>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed}
                            className="flex items-center"
                            variant={canProceed ? "primary" : "outline"}
                        >
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        className="flex items-center"
                        variant="primary"
                    >
                        Complete Booking <Check className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Debug info - remove in production */}
            <div className="mt-6 p-2 text-xs bg-gray-100 rounded">
                <h4 className="font-medium mb-1">Debug Information</h4>

                <p>Current step: {currentStep}</p>
                <p>Selected service: {selectedService ? selectedService.id : 'none'}</p>
                <p>Selected staff: {bookingData.staffMember ? bookingData.staffMember.name : 'none'}</p>
                <p>Staff ID: {bookingData.staffMember ? bookingData.staffMember.id : 'none'}</p>
                <p>Staff object: {bookingData.staffMember ? JSON.stringify(bookingData.staffMember) : 'null'}</p>
                <p>Selected date: {bookingData.date ? new Date(bookingData.date).toLocaleDateString() : 'none'}</p>
                <p>Date type: {bookingData.date ? `${typeof bookingData.date} - isDate: ${bookingData.date instanceof Date}` : 'none'}</p>
                <p>Raw date: {bookingData.date ? JSON.stringify(bookingData.date) : 'none'}</p>
                <p>Selected time: {bookingData.time ? (bookingData.time.time ? new Date(bookingData.time.time).toLocaleTimeString() : 'invalid format') : 'none'}</p>
                <p>Can proceed: {canProceed ? 'Yes' : 'No'}</p>
                <p>Validation errors: {Object.keys(validationErrors).length > 0 ? JSON.stringify(validationErrors) : 'None'}</p>
                {typeof window !== 'undefined' && (
                    <>
                        <p>Booking data in localStorage: {localStorage.getItem('bookingData') ? 'Yes' : 'No'}</p>
                        <p>Service in localStorage: {localStorage.getItem('selectedService') ? 'Yes' : 'No'}</p>
                        <div className="mt-2">
                            <button
                                className="text-blue-500 underline"
                                onClick={() => {
                                    try {
                                        const bookingDataFromStorage = JSON.parse(localStorage.getItem('bookingData') || '{}');
                                        alert(`Staff in localStorage: ${bookingDataFromStorage.staffMember ?
                                            JSON.stringify(bookingDataFromStorage.staffMember) : 'none'}`);
                                    } catch (e) {
                                        alert(`Error reading localStorage: ${e.message}`);
                                    }
                                }}
                            >
                                Check Staff in Storage
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
} 