"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent } from "@/app/components/ui/card";
import { formatDate, formatTime } from "@/lib/utils";
import { addDays, format, isBefore, isSameDay, startOfToday } from "date-fns";
import { AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function DateTimeSelection({ selectedDate, selectedTime, selectedStaff, onDateSelect, onTimeSelect, onStaffSelect }) {
    const [date, setDate] = useState(selectedDate || addDays(new Date(), 1));
    const [staffAvailability, setStaffAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get the selected service from the parent component
    const getServiceIdFromUrl = () => {
        if (typeof window === 'undefined') return null;

        const params = new URLSearchParams(window.location.search);
        // Check URL for serviceId first
        const serviceId = params.get('service');

        // If not in URL, maybe it's in localStorage (set by previous step)
        if (!serviceId) {
            try {
                const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
                return bookingData.service?.id;
            } catch (e) {
                console.error('Error parsing booking data from localStorage:', e);
                return null;
            }
        }

        return serviceId;
    };

    // Fetch availability when date changes
    useEffect(() => {
        const serviceId = getServiceIdFromUrl();

        if (!serviceId) {
            setError("Service selection is required before checking availability");
            return;
        }

        const fetchAvailability = async () => {
            if (!date) return;

            try {
                setIsLoading(true);
                console.log("Fetching availability for date:", date);

                const response = await fetch(`/api/availability?date=${format(date, 'yyyy-MM-dd')}&serviceId=${serviceId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch availability');
                }

                const data = await response.json();
                console.log("Availability data received:", data);
                setStaffAvailability(data.availability || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching availability:", err);
                setError("Failed to load availability. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailability();
    }, [date]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
        onDateSelect(newDate);

        // Reset time and staff selection when date changes
        onTimeSelect(null);
        onStaffSelect(null);
    };

    const handleStaffTimeSelection = (staffId, timeSlot) => {
        const staff = staffAvailability.find(staff => staff.id === staffId);

        if (staff) {
            onStaffSelect(staff);
            onTimeSelect(timeSlot);
        }
    };

    // Calculate available dates (today + 30 days)
    const today = startOfToday();
    const maxDate = addDays(today, 30);

    const isTimeSlotSelected = (staffId, timeSlot) => {
        return selectedStaff?.id === staffId && selectedTime?.time === timeSlot.time;
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Select a Date</h3>
                <p className="text-sm text-muted-foreground">
                    Choose a date for your appointment
                </p>

                <div className="border rounded-md p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateChange}
                        disabled={(date) => isBefore(date, today) || isBefore(maxDate, date)}
                        className="mx-auto"
                    />
                </div>

                <div className="text-sm text-muted-foreground text-center mt-2">
                    Appointments available for the next 30 days
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium">Select a Time & Staff Member</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Choose a staff member and available time slot for {date ? format(date, "EEEE, MMMM d") : "your appointment"}
                </p>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading availability...</p>
                    </div>
                ) : staffAvailability.length === 0 ? (
                    <div className="text-center py-8 border rounded-md bg-muted/50">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <h4 className="font-medium mb-1">No Availability</h4>
                        <p className="text-muted-foreground">
                            No available time slots found for {format(date, "MMMM d")}.
                            <br />Please select a different date.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {staffAvailability.map((staff) => (
                            <Card key={staff.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-4 p-4 border-b">
                                        <Avatar className="h-10 w-10">
                                            {staff.image && (
                                                <img src={staff.image} alt={staff.name} />
                                            )}
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium">{staff.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {staff.slots.length} available slot{staff.slots.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 p-4">
                                        {staff.slots.map((slot) => (
                                            <Button
                                                key={slot.time}
                                                variant={isTimeSlotSelected(staff.id, slot) ? "default" : "outline"}
                                                size="sm"
                                                className="relative"
                                                onClick={() => handleStaffTimeSelection(staff.id, slot)}
                                            >
                                                {formatTime(slot.time)}
                                                {isTimeSlotSelected(staff.id, slot) && (
                                                    <CheckCircle className="h-3 w-3 absolute top-1 right-1" />
                                                )}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 