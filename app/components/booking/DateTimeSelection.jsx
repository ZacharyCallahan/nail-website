"use client";

import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { addDays, format, isSameDay } from "date-fns";
import { Check, Clock } from "lucide-react";
import { useState } from "react";

// Sample data - in a real app, this would be fetched from an API
const staff = [
    {
        id: "staff-1",
        name: "Sarah Johnson",
        role: "Senior Nail Technician",
        bio: "Specializes in nail art and gel manicures.",
        image: "/images/staff/sarah.jpg",
        available: true,
    },
    {
        id: "staff-2",
        name: "Michael Lee",
        role: "Nail Artist",
        bio: "Expert in intricate nail designs and acrylic extensions.",
        image: "/images/staff/michael.jpg",
        available: true,
    },
    {
        id: "staff-3",
        name: "Jessica Smith",
        role: "Nail Technician",
        bio: "Specializes in pedicures and natural nail care.",
        image: "/images/staff/jessica.jpg",
        available: true,
    },
];

// Sample time slots - in a real app, these would be generated based on staff availability
const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 19; // 7 PM
    const interval = 30; // 30 minutes

    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push({
                id: `time-${time}`,
                time: time,
                available: Math.random() > 0.3, // Randomly mark some slots as unavailable
            });
        }
    }
    return slots;
};

export function DateTimeSelection({ selectedDate, selectedTime, selectedStaff, onDateSelect, onTimeSelect, onStaffSelect }) {
    const [timeSlots, setTimeSlots] = useState(generateTimeSlots());

    // Minimum date is today, maximum date is 30 days from now
    const minDate = new Date();
    const maxDate = addDays(new Date(), 30);

    const handleDateSelect = (date) => {
        onDateSelect(date);
        // In a real app, this would trigger an API call to fetch available time slots for the selected date
        setTimeSlots(generateTimeSlots());
        onTimeSelect(null); // Reset time selection when date changes
    };

    const handleTimeSelect = (timeSlot) => {
        if (!timeSlot.available) return;
        onTimeSelect(timeSlot);
    };

    const handleStaffSelect = (staffMember) => {
        onStaffSelect(staffMember);
        // In a real app, this would trigger an API call to fetch available time slots for the selected staff
        setTimeSlots(generateTimeSlots());
        onTimeSelect(null); // Reset time selection when staff changes
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Choose a Date and Time</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Select Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                disabled={{ before: minDate, after: maxDate }}
                                className="rounded-md border"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Staff Selection */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Choose Staff (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Select a staff member or leave unselected for any available technician.
                                </p>
                                {staff.map((staffMember) => (
                                    <div
                                        key={staffMember.id}
                                        className={`p-3 border rounded-md cursor-pointer transition-all flex items-center gap-3 ${selectedStaff?.id === staffMember.id
                                                ? "ring-2 ring-primary bg-primary/5"
                                                : "hover:border-primary/50"
                                            } ${!staffMember.available ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={() => staffMember.available && handleStaffSelect(staffMember)}
                                    >
                                        <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{staffMember.name}</h4>
                                            <p className="text-xs text-muted-foreground">{staffMember.role}</p>
                                        </div>
                                        {selectedStaff?.id === staffMember.id && (
                                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">
                        Available Times for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </h3>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {timeSlots.map((slot) => (
                            <Button
                                key={slot.id}
                                variant={selectedTime?.id === slot.id ? "default" : "outline"}
                                className={`${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                                disabled={!slot.available}
                                onClick={() => handleTimeSelect(slot)}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                {slot.time}
                            </Button>
                        ))}
                    </div>

                    {timeSlots.length === 0 && (
                        <p className="text-center text-muted-foreground">
                            No available time slots for the selected date.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
} 