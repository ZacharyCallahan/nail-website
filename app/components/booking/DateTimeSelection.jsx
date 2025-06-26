"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent } from "@/app/components/ui/card";
import { Select } from "@/app/components/ui/select";
import { formatDate, formatTime } from "@/lib/utils";
import { addDays, format, isBefore, isSameDay, startOfToday } from "date-fns";
import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, Loader2, User } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

export function DateTimeSelection({ selectedDate, selectedTime, selectedStaff, onDateSelect, onTimeSelect, onStaffSelect }) {
    // IMPORTANT: Fix date initialization to respect the provided date prop
    const [date, setDate] = useState(() => {
        // Always use the provided date if available
        if (selectedDate) {
            console.log("Using provided date from props:", selectedDate);
            return new Date(selectedDate);
        }
        // Otherwise use tomorrow as default
        const tomorrow = addDays(new Date(), 1);
        console.log("Using default date (tomorrow):", tomorrow);
        return tomorrow;
    });

    // Synchronize local state with parent props whenever selectedDate changes
    useEffect(() => {
        if (selectedDate) {
            const newDate = new Date(selectedDate);
            console.log("Received date from parent:", newDate.toISOString());

            // Only update if the dates are actually different to avoid loops
            if (!date || newDate.toDateString() !== date.toDateString()) {
                console.log("Updating local date from parent props:", newDate.toISOString());
                setDate(newDate);
            } else {
                console.log("Date unchanged, not updating local state");
            }
        }
    }, [selectedDate, date]);

    // Prevent local state from overriding parent state
    const updateDateLocally = useCallback((newDate) => {
        if (!newDate) return;

        const dateObj = new Date(newDate);
        console.log("Updating local date state only:", dateObj.toISOString());
        setDate(dateObj);
    }, []);

    const [staffAvailability, setStaffAvailability] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    const [availableDates, setAvailableDates] = useState([]);

    // Initialize selectedStaffMember only once at component mount
    const [selectedStaffMember, setSelectedStaffMember] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);

    // Use a ref to track if availability is already being fetched
    const isFetchingRef = useRef(false);
    const apiCallCountRef = useRef(0);
    const lastFetchTimeRef = useRef(null);

    // Sync with parent props when they change
    useEffect(() => {
        if (selectedStaff && (!selectedStaffMember || selectedStaffMember.id !== selectedStaff.id)) {
            console.log("Syncing selected staff from props:", selectedStaff.name);
            setSelectedStaffMember(selectedStaff);

            // Update available times if we have staff availability data
            if (staffAvailability.length > 0) {
                const staff = staffAvailability.find(s => s.id === selectedStaff.id);
                if (staff && staff.slots) {
                    setAvailableTimes(staff.slots);
                }
            }
        }
    }, [selectedStaff, selectedStaffMember, staffAvailability]);

    // Fix date handling in useEffect to sync with parent
    useEffect(() => {
        // If date is passed in props and different from local state, update local state
        if (selectedDate && (!date || selectedDate.getTime() !== date.getTime())) {
            console.log("Syncing date from props:", selectedDate);
            setDate(selectedDate);
        } else if (!selectedDate && date) {
            // If we have a local date but parent doesn't, update the parent
            console.log("Updating parent with local date:", date);
            onDateSelect(date);
        }
    }, [selectedDate, date, onDateSelect]);

    // Initialize local state with reasonable defaults
    useEffect(() => {
        // If we don't have a selectedDate, initialize with tomorrow's date and notify parent
        if (!selectedDate && !bookingData?.date) {
            const tomorrow = addDays(new Date(), 1);
            console.log("Initializing with default date (tomorrow):", tomorrow);
            setDate(tomorrow);
            onDateSelect(tomorrow);
        }
    }, []);

    // Get the selected service from the parent component
    const getServiceIdFromUrl = () => {
        if (typeof window === 'undefined') return null;

        const params = new URLSearchParams(window.location.search);
        // Check URL for serviceId first
        const serviceId = params.get('service');

        // If not in URL, check localStorage
        if (!serviceId) {
            try {
                // First try to get from bookingData
                const bookingData = JSON.parse(localStorage.getItem('bookingData') || '{}');
                if (bookingData.service?.id) {
                    console.log("Retrieved service ID from bookingData:", bookingData.service.id);
                    return bookingData.service.id;
                }

                // Then try the selectedService directly
                const selectedService = JSON.parse(localStorage.getItem('selectedService') || '{}');
                if (selectedService.id) {
                    console.log("Retrieved service ID from selectedService:", selectedService.id);
                    return selectedService.id;
                }

                console.log("No service ID found in localStorage");
                return null;
            } catch (e) {
                console.error('Error parsing booking data from localStorage:', e);
                return null;
            }
        }

        console.log("Using service ID from URL:", serviceId);
        return serviceId;
    };

    // Fetch available dates for the calendar
    useEffect(() => {
        const serviceId = getServiceIdFromUrl();
        if (!serviceId) return;

        const fetchAvailableDates = async () => {
            try {
                const response = await fetch(`/api/availability/dates?serviceId=${serviceId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.availableDates && Array.isArray(data.availableDates)) {
                        // Convert string dates to Date objects
                        const dates = data.availableDates.map(dateStr => new Date(dateStr));
                        setAvailableDates(dates);
                        console.log("Available dates:", dates);
                    }
                }
            } catch (error) {
                console.error("Error fetching available dates:", error);
            }
        };

        fetchAvailableDates();
    }, []);

    // Fetch availability when date changes
    useEffect(() => {
        const serviceId = getServiceIdFromUrl();
        setDebugInfo(prev => ({ ...prev, serviceId }));

        if (!serviceId) {
            setError("Service selection is required before checking availability");
            return;
        }

        if (!date) return;

        // Prevent duplicate API calls for the same date
        const currentDate = date.toISOString().split('T')[0];
        if (
            lastFetchTimeRef.current &&
            Date.now() - lastFetchTimeRef.current < 1000 &&
            debugInfo.lastFetchedDate === currentDate
        ) {
            console.log("Skipping duplicate fetch for date:", currentDate);
            return;
        }

        // Update tracking information
        lastFetchTimeRef.current = Date.now();
        setDebugInfo(prev => ({ ...prev, lastFetchedDate: currentDate }));

        // If we're already fetching, don't fetch again
        if (isFetchingRef.current) {
            console.log("Already fetching availability, skipping duplicate request");
            return;
        }

        const fetchAvailability = async () => {
            // Create an abort controller for timeout handling
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            try {
                setIsLoading(true);
                isFetchingRef.current = true;
                apiCallCountRef.current++;

                console.log(`API call #${apiCallCountRef.current} - Fetching availability for date:`, date, "with service ID:", serviceId);

                const formattedDate = format(date, 'yyyy-MM-dd');
                console.log("Formatted date for API call:", formattedDate);

                const response = await fetch(`/api/availability?date=${formattedDate}&serviceId=${serviceId}`, {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                setDebugInfo(prev => ({
                    ...prev,
                    apiUrl: `/api/availability?date=${formattedDate}&serviceId=${serviceId}`,
                    responseStatus: response.status,
                    responseOk: response.ok,
                    apiCallCount: apiCallCountRef.current
                }));

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("API error response:", errorText);
                    throw new Error(`Failed to fetch availability: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Availability data received:", data);
                setDebugInfo(prev => ({ ...prev, availabilityData: data }));

                if (!data.availability || !Array.isArray(data.availability)) {
                    console.error("Invalid availability data format:", data);
                    setStaffAvailability([]);
                } else {
                    setStaffAvailability(data.availability);

                    // Reset staff selection when date changes
                    setSelectedStaffMember(null);
                    setAvailableTimes([]);
                }

                setError(null);
            } catch (err) {
                clearTimeout(timeoutId);

                if (err.name === 'AbortError') {
                    console.error("Request timed out");
                    setError("The request took too long to complete. Please try again or select a different date.");
                } else {
                    console.error("Error fetching availability:", err);
                    setError("Failed to load availability. Please try again.");
                }

                setDebugInfo(prev => ({ ...prev, error: err.message }));
                setStaffAvailability([]);
            } finally {
                setIsLoading(false);
                isFetchingRef.current = false;
            }
        };

        fetchAvailability();
    }, [date]);

    const handleDateChange = (newDate) => {
        if (!newDate) {
            console.error("Received null date in handleDateChange");
            return;
        }

        console.log("Date changed in DateTimeSelection:", newDate);

        try {
            // Ensure newDate is a Date object
            let dateObj;
            if (!(newDate instanceof Date)) {
                console.log("Converting to Date object:", newDate);
                dateObj = new Date(newDate);
            } else {
                dateObj = newDate;
            }

            // Validate the date
            if (isNaN(dateObj.getTime())) {
                console.error("Invalid date object:", dateObj);
                return;
            }

            // Store the current date for comparison
            const currentDateString = date ? date.toDateString() : null;
            const newDateString = dateObj.toDateString();

            // Only proceed if the date actually changed
            if (currentDateString !== newDateString) {
                console.log(`Date changed from ${currentDateString} to ${newDateString}`);

                // Update local state first
                setDate(dateObj);

                // IMPORTANT: Only reset time selection, not staff selection
                // This allows users to keep their staff selection when changing dates
                if (selectedTime) {
                    console.log("Resetting time selection only");
                    setAvailableTimes([]);
                    onTimeSelect(null);
                }

                // Notify parent component with the new date
                console.log("Notifying parent of date change:", dateObj.toISOString());
                onDateSelect(dateObj);

                // Update debug info
                setDebugInfo(prev => ({
                    ...prev,
                    lastDateSelection: dateObj.toISOString(),
                    dateChangedTimestamp: new Date().getTime()
                }));
            } else {
                console.log("Date unchanged, not updating");
            }
        } catch (error) {
            console.error("Error in handleDateChange:", error);
        }
    };

    const handleStaffSelection = (staffId) => {
        // If this staff is already selected, don't do anything
        if (selectedStaffMember && selectedStaffMember.id === staffId) {
            console.log("Staff already selected:", staffId);
            return;
        }

        console.log("Staff selected:", staffId);
        const staff = staffAvailability.find(s => s.id === staffId);

        if (staff) {
            // Log the full staff object
            console.log("Found staff object:", JSON.stringify(staff));

            // Update local state
            setSelectedStaffMember(staff);

            // Update available times
            const staffSlots = staff.slots || [];
            setAvailableTimes(staffSlots);

            // Ensure the staff object has all required fields
            const staffToSend = {
                id: staff.id,
                name: staff.name,
                image: staff.image || null
            };

            // Directly notify parent of selection with a complete object
            console.log("Calling onStaffSelect with:", staffToSend);
            onStaffSelect(staffToSend);

            // Reset time selection
            onTimeSelect(null);

            // Add a confirmation alert for debugging
            alert(`Staff selected: ${staffToSend.name} (ID: ${staffToSend.id})`);
        } else {
            console.error("Staff not found with ID:", staffId);
        }
    };

    const handleTimeSelection = (timeSlot) => {
        console.log("Time selected in DateTimeSelection:", timeSlot);

        if (timeSlot === null || timeSlot === undefined) {
            console.log("Clearing time selection");
            // Just pass null to parent
            onTimeSelect(null);
            return;
        }

        if (selectedStaffMember) {
            console.log("Updating parent with time selection:", timeSlot);
            // No need to update local state for time since we're just passing it to parent
            onTimeSelect(timeSlot);
        } else {
            console.error("Cannot select time without staff member");
        }
    };

    // Calculate available dates (today + 30 days)
    const today = startOfToday();
    const maxDate = addDays(today, 30);

    // Function to check if a date is available (has staff available)
    const isDateAvailable = (date) => {
        return availableDates.some(availableDate =>
            isSameDay(new Date(availableDate), date)
        );
    };

    // Create a simple custom calendar that doesn't rely on the DayPicker component
    const SimpleCalendar = ({ onDateChange, selected, disabled }) => {
        // Track the last selected date to prevent unwanted resets
        const lastSelectedRef = useRef(selected ? new Date(selected) : null);

        const [currentMonth, setCurrentMonth] = useState(() => {
            // Start with the selected date's month or current month
            return selected ? new Date(selected) : new Date();
        });

        // Update month view when selected date changes to a different month
        useEffect(() => {
            if (selected) {
                const newSelectedDate = new Date(selected);
                const currentMonthValue = currentMonth.getMonth();
                const selectedMonthValue = newSelectedDate.getMonth();

                // If the selected date is in a different month, update the current month
                if (currentMonthValue !== selectedMonthValue ||
                    currentMonth.getFullYear() !== newSelectedDate.getFullYear()) {
                    console.log("Updating calendar view to selected date's month");
                    setCurrentMonth(new Date(newSelectedDate));
                }

                // Update the last selected reference
                lastSelectedRef.current = newSelectedDate;
            }
        }, [selected, currentMonth]);

        // Process the disabled function to handle dates properly
        const isDateDisabled = useCallback((date) => {
            if (!date) return true;
            if (!disabled) return false;

            try {
                return disabled(date);
            } catch (err) {
                console.error("Error checking if date is disabled:", err);
                return false;
            }
        }, [disabled]);

        // Generate calendar days for the current month
        const generateCalendarDays = useCallback(() => {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth();

            // First day of the month
            const firstDay = new Date(year, month, 1);
            const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Last day of the month
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();

            // Generate array of days
            const days = [];

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfWeek; i++) {
                days.push({ day: null, isCurrentMonth: false });
            }

            // Add days of the current month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const isDisabled = isDateDisabled(date);

                // Check if this day is selected by comparing date strings
                let isSelected = false;
                if (selected) {
                    isSelected = date.toDateString() === new Date(selected).toDateString();
                }

                days.push({
                    day,
                    date,
                    isCurrentMonth: true,
                    isDisabled,
                    isSelected,
                    isToday: date.toDateString() === new Date().toDateString()
                });
            }

            return days;
        }, [currentMonth, selected, isDateDisabled]);

        const days = generateCalendarDays();

        // Go to previous month
        const prevMonth = () => {
            setCurrentMonth(prev => {
                const newMonth = new Date(prev);
                newMonth.setMonth(prev.getMonth() - 1);
                return newMonth;
            });
        };

        // Go to next month
        const nextMonth = () => {
            setCurrentMonth(prev => {
                const newMonth = new Date(prev);
                newMonth.setMonth(prev.getMonth() + 1);
                return newMonth;
            });
        };

        // Handle day click with persistence
        const handleDayClick = (date) => {
            if (!date) return;

            try {
                // Ensure we're working with a proper Date object
                const dateObj = new Date(date);
                if (isNaN(dateObj.getTime())) {
                    console.error("Invalid date in handleDayClick:", date);
                    return;
                }

                // Store this selection to prevent it from being overridden
                lastSelectedRef.current = dateObj;
                console.log("Simple calendar day clicked:", dateObj.toDateString());

                // Notify parent
                onDateChange(dateObj);
            } catch (error) {
                console.error("Error in handleDayClick:", error);
            }
        };

        // Format the current month and year
        const monthYearString = format(currentMonth, 'MMMM yyyy');

        // Day names
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <div className="simple-calendar">
                <div className="mb-2 text-xs text-center text-green-700 bg-green-50 p-1 rounded-md">
                    <p className="font-medium">Selected date: {selected ? format(selected, 'EEEE, MMMM d, yyyy') : 'None'}</p>
                    <p>Click on a date to select it</p>
                </div>

                {/* Calendar header */}
                <div className="flex justify-between items-center mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={prevMonth}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="font-medium">{monthYearString}</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={nextMonth}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => (
                        <Button
                            key={`day-${index}`}
                            variant={day.isSelected ? "default" : day.isToday ? "secondary" : "ghost"}
                            className={`h-9 w-full p-0 ${!day.isCurrentMonth ? 'invisible' :
                                day.isDisabled ? 'text-gray-300 cursor-not-allowed' :
                                    'hover:bg-primary/20'
                                } ${day.isSelected ? 'bg-primary text-white' : ''}`}
                            disabled={!day.isCurrentMonth || day.isDisabled}
                            onClick={() => day.isCurrentMonth && !day.isDisabled && handleDayClick(day.date)}
                        >
                            {day.day}
                        </Button>
                    ))}
                </div>

                <div className="text-xs text-center mt-2 p-1 bg-blue-50 rounded">
                    If calendar doesn't work, use the manual date buttons above.
                </div>
            </div>
        );
    };

    // Replace the DebugCalendar component with our SimpleCalendar
    const DebugCalendar = SimpleCalendar;

    // Debug function to directly test staff selection
    const testStaffSelection = () => {
        if (staffAvailability.length === 0) {
            alert("No staff available to select");
            return;
        }

        // Get the first available staff
        const staff = staffAvailability[0];
        console.log("Testing staff selection with:", staff);

        // Create a clean staff object
        const cleanStaff = {
            id: staff.id,
            name: staff.name,
            image: staff.image || null
        };

        // Update local state
        setSelectedStaffMember(cleanStaff);

        // Directly call parent callback
        console.log("Directly calling onStaffSelect with:", cleanStaff);
        onStaffSelect(cleanStaff);

        alert(`Test staff selection: ${cleanStaff.name} (ID: ${cleanStaff.id})`);
    };

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {/* Debug panel */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                <h4 className="font-medium mb-2">Debug Panel</h4>
                <div className="text-xs mb-2">
                    <p>Local date: {date ? format(date, 'yyyy-MM-dd') : 'None'}</p>
                    <p>Parent date: {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'None'}</p>
                    <p>Date type: {date ? `${typeof date} - isDate: ${date instanceof Date}` : 'none'}</p>
                    <p>Parent date type: {selectedDate ? `${typeof selectedDate} - isDate: ${selectedDate instanceof Date}` : 'none'}</p>
                    <p>Date matches: {date && selectedDate ? (date.toDateString() === selectedDate.toDateString() ? 'Yes' : 'No') : 'N/A'}</p>
                    <p>Selected staff: {selectedStaffMember ? selectedStaffMember.name : 'None'}</p>
                    <p>Parent staff: {selectedStaff ? selectedStaff.name : 'None'}</p>
                    <p>Staff matches: {selectedStaffMember && selectedStaff ? (selectedStaffMember.id === selectedStaff.id ? 'Yes' : 'No') : 'N/A'}</p>
                    <p>Selected time: {selectedTime ? (typeof selectedTime === 'object' && selectedTime.time ? selectedTime.time : 'Invalid format') : 'None'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            try {
                                const tomorrow = addDays(new Date(), 1);
                                handleDateChange(tomorrow);
                            } catch (e) {
                                console.error("Error setting tomorrow's date:", e);
                            }
                        }}
                    >
                        Set Tomorrow
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            try {
                                const nextWeek = addDays(new Date(), 7);
                                handleDateChange(nextWeek);
                            } catch (e) {
                                console.error("Error setting next week's date:", e);
                            }
                        }}
                    >
                        Set Next Week
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            try {
                                // Direct call to parent
                                const today = new Date();
                                onDateSelect(today);
                                setDate(today);
                                // Only clear time, not staff
                                onTimeSelect(null);
                                alert(`Direct parent update: ${today.toDateString()}`);
                            } catch (e) {
                                console.error("Error updating today's date:", e);
                            }
                        }}
                    >
                        Direct Update Today
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            try {
                                // Fix sync issues by forcing both states to match
                                if (date) {
                                    // Use local date to update parent
                                    const fixedDate = new Date(date);
                                    onDateSelect(fixedDate);
                                    // Only clear time, not staff
                                    onTimeSelect(null);
                                    alert(`Sync fixed with local date: ${fixedDate.toDateString()}`);
                                } else if (selectedDate) {
                                    // Use parent date to update local
                                    const fixedDate = new Date(selectedDate);
                                    setDate(fixedDate);
                                    alert(`Sync fixed with parent date: ${fixedDate.toDateString()}`);
                                } else {
                                    // No date exists, create new one
                                    const fixedDate = addDays(new Date(), 1);
                                    setDate(fixedDate);
                                    onDateSelect(fixedDate);
                                    // Only clear time, not staff
                                    onTimeSelect(null);
                                    alert(`Sync fixed with new date: ${fixedDate.toDateString()}`);
                                }
                            } catch (e) {
                                console.error("Error fixing date sync:", e);
                            }
                        }}
                    >
                        Fix Date Sync
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                            window.location.reload();
                        }}
                    >
                        Reload Page
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                            // Force staff selection if available
                            if (staffAvailability.length > 0) {
                                const staff = staffAvailability[0];
                                console.log("Manually setting staff:", staff);
                                setSelectedStaffMember(staff);
                                onStaffSelect(staff);
                                alert(`Staff manually set to: ${staff.name}`);
                            } else {
                                alert("No staff available to select");
                            }
                        }}
                    >
                        Force Staff Selection
                    </Button>
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={testStaffSelection}
                    >
                        Test Staff Selection
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium">Select a Date</h3>
                <p className="text-sm text-muted-foreground">
                    Choose a date for your appointment
                </p>

                <div className="border rounded-md p-4">
                    <DebugCalendar
                        mode="single"
                        selected={date}
                        onDateChange={handleDateChange}
                        disabled={(date) => {
                            try {
                                // Check if date is before today or after max date
                                const isBeforeToday = isBefore(date, today);
                                const isAfterMax = isBefore(maxDate, date);
                                return isBeforeToday || isAfterMax;
                            } catch (err) {
                                console.error("Error in date disabled check:", err);
                                return false;
                            }
                        }}
                        className="mx-auto"
                    />
                </div>

                <div className="text-sm text-muted-foreground text-center mt-2">
                    Appointments available for the next 30 days
                </div>
            </div>

            {/* Staff Selection */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Select a Staff Member</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Choose your preferred staff member for {date ? format(date, "EEEE, MMMM d") : "your appointment"}
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
                            No available staff found for {format(date, "MMMM d")}.
                            <br />Please select a different date.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {staffAvailability.map((staff) => (
                            <Card
                                key={staff.id}
                                className={`overflow-hidden cursor-pointer transition-all ${selectedStaffMember?.id === staff.id
                                    ? 'ring-2 ring-primary shadow-md'
                                    : 'hover:shadow-md'
                                    }`}
                                onClick={() => {
                                    console.log("Staff card clicked:", staff.id);

                                    // Create a clean staff object to ensure it can be serialized
                                    const cleanStaff = {
                                        id: staff.id,
                                        name: staff.name,
                                        image: staff.image || null
                                    };

                                    // Update local state directly
                                    setSelectedStaffMember(cleanStaff);

                                    // Call parent callback directly with the clean object
                                    console.log("Directly calling onStaffSelect from card click with:", cleanStaff);
                                    onStaffSelect(cleanStaff);

                                    // Show confirmation
                                    alert(`Staff selected directly: ${cleanStaff.name} (ID: ${cleanStaff.id})`);
                                }}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16">
                                            {staff.image && (
                                                <img src={staff.image} alt={staff.name} />
                                            )}
                                        </Avatar>
                                        <div>
                                            <h4 className="font-medium text-lg">
                                                {staff.name}
                                                {selectedStaffMember?.id === staff.id && (
                                                    <CheckCircle className="h-5 w-5 inline ml-2 text-primary" />
                                                )}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {staff.slots.length} available time{staff.slots.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Time Selection - Only shown when staff is selected */}
            {selectedStaffMember && availableTimes.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select a Time</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Choose an available time slot with {selectedStaffMember.name}
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {availableTimes.map((timeSlot, index) => {
                            const isSelected = selectedTime && selectedTime.time === timeSlot.time;
                            return (
                                <Button
                                    key={`${timeSlot.time}-${index}`}
                                    className={`relative ${isSelected
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    variant={isSelected ? "default" : "outline"}
                                    onClick={() => handleTimeSelection(timeSlot)}
                                >
                                    {formatTime(timeSlot.time)}
                                    {isSelected && (
                                        <CheckCircle className="h-3 w-3 absolute top-1 right-1" />
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected appointment summary */}
            {selectedStaffMember && selectedTime && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 mb-2">Selected Appointment</h4>
                    <div className="text-sm text-green-700">
                        <p><strong>Date:</strong> {date ? format(date, "EEEE, MMMM d, yyyy") : "Not selected"}</p>
                        <p><strong>Staff:</strong> {selectedStaffMember.name}</p>
                        <p><strong>Time:</strong> {formatTime(selectedTime.time)}</p>
                    </div>
                </div>
            )}

            {/* Debug information */}
            <div className="mt-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h4 className="text-sm font-semibold mb-2">Debug Information</h4>
                <div className="text-xs space-y-1">
                    <p>Selected Date: {date ? format(date, 'yyyy-MM-dd') : 'None'}</p>
                    <p>Service ID: {debugInfo.serviceId || 'None'}</p>
                    <p>Selected Staff: {selectedStaffMember ? selectedStaffMember.name : 'None'}</p>
                    <p>Selected Time: {selectedTime ? formatTime(selectedTime.time) : 'None'}</p>
                    <p>API Call Count: {apiCallCountRef.current}</p>
                    <p>Last API Call Response: {debugInfo.responseStatus || 'N/A'}</p>
                    <p>Staff Availability Count: {staffAvailability.length}</p>
                    <p>Available Times: {availableTimes.length}</p>
                    {debugInfo.error && <p className="text-red-500">Error: {debugInfo.error}</p>}
                </div>
            </div>
        </div>
    );
} 