"use client";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { formatDate, formatTime } from "@/lib/utils";
import { addMonths, format, isSameDay } from "date-fns";
import { AlertCircle, Calendar as CalendarIcon, Clock, Loader2, Plus, Repeat, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function AvailabilityManager() {
    const [selectedTab, setSelectedTab] = useState("weekly");
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState("");
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [staffMembers, setStaffMembers] = useState([]);
    const [availabilitySlots, setAvailabilitySlots] = useState([]);
    const [error, setError] = useState(null);
    const [newSlot, setNewSlot] = useState({
        type: "weekly", // "weekly" or "specific"
        startTime: "09:00",
        endTime: "17:00",
        days: [1, 2, 3, 4, 5], // Monday to Friday (used for weekly)
        specificDate: new Date(), // Used for specific date
    });

    const weekdays = [
        { value: 0, label: "Sunday" },
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" },
    ];

    // Fetch availability data from API
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/admin/availability${selectedStaff ? `?staffId=${selectedStaff}` : ''}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch availability data');
                }

                const data = await response.json();

                // Format the schedules for display
                const formattedSchedules = data.schedules.map(schedule => ({
                    id: schedule.id,
                    staffId: schedule.staffId,
                    staffName: schedule.staff.user.name,
                    type: schedule.specificDate ? "specific" : "weekly",
                    days: schedule.dayOfWeek !== null ? [schedule.dayOfWeek] : [], // Put in array for compatibility with UI
                    specificDate: schedule.specificDate ? new Date(schedule.specificDate) : null,
                    startTime: formatTimeFromDate(schedule.startTime),
                    endTime: formatTimeFromDate(schedule.endTime),
                    isAvailable: schedule.isAvailable
                }));

                // Format staff members for dropdown
                const formattedStaff = data.staffMembers.map(staff => ({
                    id: staff.id,
                    name: staff.user.name
                }));

                setAvailabilitySlots(formattedSchedules);
                setStaffMembers(formattedStaff);
                setError(null);
            } catch (err) {
                console.error("Error fetching availability:", err);
                setError("Failed to load availability data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, [selectedStaff]);

    // Helper function to format time from date object
    function formatTimeFromDate(dateString) {
        const date = new Date(dateString);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const handleSlotTypeChange = (value) => {
        setNewSlot(prev => ({ ...prev, type: value }));
    };

    const handleDayToggle = (day) => {
        setNewSlot(prev => {
            if (prev.days.includes(day)) {
                return { ...prev, days: prev.days.filter(d => d !== day) };
            } else {
                return { ...prev, days: [...prev.days, day].sort((a, b) => a - b) };
            }
        });
    };

    const handleSpecificDateChange = (date) => {
        setNewSlot(prev => ({ ...prev, specificDate: date }));
    };

    const handleAddSlot = async () => {
        if (!selectedStaff) return;

        // For weekly schedules, we need at least one day selected
        if (newSlot.type === "weekly" && newSlot.days.length === 0) {
            setError("Please select at least one day of the week");
            return;
        }

        // For specific date, we need a valid date
        if (newSlot.type === "specific" && !newSlot.specificDate) {
            setError("Please select a specific date");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/availability', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    staffId: selectedStaff,
                    type: newSlot.type,
                    days: newSlot.type === "weekly" ? newSlot.days : null,
                    specificDate: newSlot.type === "specific" ? format(newSlot.specificDate, 'yyyy-MM-dd') : null,
                    startTime: newSlot.startTime,
                    endTime: newSlot.endTime,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add availability');
            }

            // Reset form and refresh data
            setIsAddingSlot(false);

            // Refresh the availability data
            const refreshResponse = await fetch(`/api/admin/availability${selectedStaff ? `?staffId=${selectedStaff}` : ''}`);
            const refreshData = await refreshResponse.json();

            // Format the schedules for display
            const formattedSchedules = refreshData.schedules.map(schedule => ({
                id: schedule.id,
                staffId: schedule.staffId,
                staffName: schedule.staff.user.name,
                type: schedule.specificDate ? "specific" : "weekly",
                days: schedule.dayOfWeek !== null ? [schedule.dayOfWeek] : [],
                specificDate: schedule.specificDate ? new Date(schedule.specificDate) : null,
                startTime: formatTimeFromDate(schedule.startTime),
                endTime: formatTimeFromDate(schedule.endTime),
                isAvailable: schedule.isAvailable
            }));

            setAvailabilitySlots(formattedSchedules);

        } catch (error) {
            console.error("Error adding slot:", error);
            setError("Failed to add availability slot. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!confirm("Are you sure you want to delete this availability slot?")) {
            return;
        }

        try {
            const response = await fetch('/api/admin/availability', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    isDelete: true
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete availability');
            }

            // Remove the slot from the UI
            setAvailabilitySlots(prev => prev.filter(slot => slot.id !== id));

        } catch (error) {
            console.error("Error deleting slot:", error);
            setError("Failed to delete availability slot. Please try again.");
        }
    };

    // Filter slots by selected staff
    const weeklySlots = availabilitySlots
        .filter(slot => slot.type === "weekly")
        .filter(slot => !selectedStaff || slot.staffId === selectedStaff);

    const specificSlots = availabilitySlots
        .filter(slot => slot.type === "specific")
        .filter(slot => !selectedStaff || slot.staffId === selectedStaff);

    const formatDayList = (days) => {
        if (days.length === 7) return "Every day";
        if (days.length === 5 && days.includes(1) && days.includes(5)) return "Weekdays";
        if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";

        return days.map(d => weekdays.find(w => w.value === d)?.label).join(", ");
    };

    // Check if a specific date has any availability set
    const hasAvailabilityOnDate = (date) => {
        return specificSlots.some(slot =>
            slot.specificDate && isSameDay(slot.specificDate, date)
        );
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            {/* Staff Selection */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="staff-select" className="mb-2 block">Select Staff Member</Label>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                        <SelectTrigger id="staff-select" className="w-full">
                            <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all-staff">All Staff</SelectItem>
                            {staffMembers.map((staff) => (
                                <SelectItem key={staff.id} value={staff.id}>
                                    {staff.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-end">
                    <Button onClick={() => setIsAddingSlot(true)} disabled={isAddingSlot || !selectedStaff}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Availability
                    </Button>
                </div>
            </div>

            {/* Add New Availability Slot Form */}
            {isAddingSlot && selectedStaff && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Add New Availability</h3>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsAddingSlot(false)}
                                disabled={isSubmitting}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {/* Availability Type Selection */}
                            <div className="space-y-2">
                                <Label>Availability Type</Label>
                                <RadioGroup
                                    value={newSlot.type}
                                    onValueChange={handleSlotTypeChange}
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="weekly" id="weekly" />
                                        <Label htmlFor="weekly" className="flex items-center">
                                            <Repeat className="h-4 w-4 mr-1" />
                                            Weekly Recurring
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="specific" id="specific" />
                                        <Label htmlFor="specific" className="flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-1" />
                                            Specific Date
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Time Selection */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="start-time">Start Time</Label>
                                        <Input
                                            id="start-time"
                                            type="time"
                                            value={newSlot.startTime}
                                            onChange={(e) => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end-time">End Time</Label>
                                        <Input
                                            id="end-time"
                                            type="time"
                                            value={newSlot.endTime}
                                            onChange={(e) => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                {/* Day/Date Selection */}
                                <div className="space-y-2">
                                    {newSlot.type === "weekly" ? (
                                        <>
                                            <Label>Days Available</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {weekdays.map((day) => (
                                                    <div key={day.value} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`day-${day.value}`}
                                                            checked={newSlot.days.includes(day.value)}
                                                            onCheckedChange={() => handleDayToggle(day.value)}
                                                        />
                                                        <Label htmlFor={`day-${day.value}`} className="text-sm">
                                                            {day.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label>Specific Date</Label>
                                            <div className="border rounded-md p-3">
                                                <Calendar
                                                    mode="single"
                                                    selected={newSlot.specificDate}
                                                    onSelect={handleSpecificDateChange}
                                                    disabled={(date) => date < new Date()}
                                                    className="mx-auto"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                className="w-full mt-6"
                                onClick={handleAddSlot}
                                disabled={isSubmitting || (newSlot.type === "weekly" && newSlot.days.length === 0)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Availability"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current Availability Display */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="weekly" className="flex items-center">
                        <Repeat className="h-4 w-4 mr-2" />
                        Weekly Schedule
                    </TabsTrigger>
                    <TabsTrigger value="calendar" className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Calendar View
                    </TabsTrigger>
                </TabsList>

                {/* Weekly Schedule View */}
                <TabsContent value="weekly" className="mt-4">
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium">Weekly Recurring Availability</h3>

                        {isLoading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p className="text-muted-foreground">Loading availability data...</p>
                            </div>
                        ) : weeklySlots.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {selectedStaff && selectedStaff !== "all-staff" ? "No weekly availability set for this staff member." : "No weekly availability set."}
                            </div>
                        ) : (
                            weeklySlots.map((slot) => (
                                <Card key={slot.id} className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div className="flex items-center justify-between p-4 border-b">
                                            <div>
                                                <p className="font-medium">{slot.staffName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">
                                                    {weekdays.find(day => day.value === slot.days[0])?.label}
                                                </Badge>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Calendar View */}
                <TabsContent value="calendar" className="mt-4">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Calendar View</h3>
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedMonth(new Date())}
                                >
                                    Today
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-md p-4">
                            <Calendar
                                mode="single"
                                selected={calendarDate}
                                onSelect={setCalendarDate}
                                month={selectedMonth}
                                onMonthChange={setSelectedMonth}
                                className="mx-auto"
                                modifiers={{
                                    hasAvailability: (date) => hasAvailabilityOnDate(date)
                                }}
                                modifiersStyles={{
                                    hasAvailability: { backgroundColor: 'rgba(34, 197, 94, 0.1)', fontWeight: 'bold' }
                                }}
                            />
                            <div className="mt-2 text-sm text-center text-muted-foreground">
                                <div className="flex items-center justify-center space-x-2">
                                    <span className="inline-block w-3 h-3 bg-green-100 rounded-full"></span>
                                    <span>Date has availability set</span>
                                </div>
                            </div>
                        </div>

                        {calendarDate && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium">
                                    Availability for {format(calendarDate, 'MMMM d, yyyy')}
                                </h3>

                                {isLoading ? (
                                    <div className="text-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Loading...</p>
                                    </div>
                                ) : (
                                    <div>
                                        {specificSlots
                                            .filter(slot => slot.specificDate && isSameDay(slot.specificDate, calendarDate))
                                            .map((slot) => (
                                                <Card key={slot.id} className="overflow-hidden mb-3">
                                                    <CardContent className="p-0">
                                                        <div className="flex items-center justify-between p-4">
                                                            <div>
                                                                <p className="font-medium">{slot.staffName}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}

                                        {specificSlots.filter(slot => slot.specificDate && isSameDay(slot.specificDate, calendarDate)).length === 0 && (
                                            <div className="text-center py-6 border rounded-md">
                                                <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                                <p className="text-muted-foreground">No specific availability set for this date.</p>
                                                {selectedStaff && selectedStaff !== "all-staff" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => {
                                                            setNewSlot(prev => ({
                                                                ...prev,
                                                                type: "specific",
                                                                specificDate: calendarDate
                                                            }));
                                                            setIsAddingSlot(true);
                                                        }}
                                                    >
                                                        <Plus className="h-4 w-4 mr-1" />
                                                        Add Availability for This Date
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
} 