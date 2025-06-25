"use client";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/app/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { useState } from "react";

export default function AvailabilityManager() {
    const [date, setDate] = useState(new Date());
    const [selectedStaff, setSelectedStaff] = useState("");
    const [isAddingSlot, setIsAddingSlot] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newSlot, setNewSlot] = useState({
        startTime: "09:00",
        endTime: "17:00",
        days: [1, 2, 3, 4, 5], // Monday to Friday
    });

    // Mock data - in a real app this would come from the database
    const staffMembers = [
        { id: "staff1", name: "Sarah Johnson" },
        { id: "staff2", name: "Michael Chen" },
        { id: "staff3", name: "Jessica Lee" },
    ];

    const weekdays = [
        { value: 0, label: "Sunday" },
        { value: 1, label: "Monday" },
        { value: 2, label: "Tuesday" },
        { value: 3, label: "Wednesday" },
        { value: 4, label: "Thursday" },
        { value: 5, label: "Friday" },
        { value: 6, label: "Saturday" },
    ];

    // Mock existing availability data
    const availabilitySlots = [
        {
            id: "slot1",
            staffId: "staff1",
            days: [1, 2, 3, 4, 5],
            startTime: "09:00",
            endTime: "17:00"
        },
        {
            id: "slot2",
            staffId: "staff2",
            days: [1, 3, 5],
            startTime: "10:00",
            endTime: "18:00"
        },
        {
            id: "slot3",
            staffId: "staff3",
            days: [2, 4, 6],
            startTime: "11:00",
            endTime: "19:00"
        },
    ];

    // Filter slots by selected staff
    const filteredSlots = selectedStaff
        ? availabilitySlots.filter(slot => slot.staffId === selectedStaff)
        : availabilitySlots;

    const handleDayToggle = (day) => {
        setNewSlot(prev => {
            if (prev.days.includes(day)) {
                return { ...prev, days: prev.days.filter(d => d !== day) };
            } else {
                return { ...prev, days: [...prev.days, day].sort((a, b) => a - b) };
            }
        });
    };

    const handleAddSlot = async () => {
        if (!selectedStaff || newSlot.days.length === 0) return;

        setIsSubmitting(true);

        try {
            // In a real app, this would make an API call to save the new slot
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset form
            setIsAddingSlot(false);

            // In a real app, you would refresh the data from the server
            alert("Availability slot added successfully!");
        } catch (error) {
            console.error("Error adding slot:", error);
            alert("Failed to add availability slot");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDayList = (days) => {
        if (days.length === 7) return "Every day";
        if (days.length === 5 && days.includes(1) && days.includes(5)) return "Weekdays";
        if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends";

        return days.map(d => weekdays.find(w => w.value === d)?.label).join(", ");
    };

    return (
        <div className="space-y-6">
            {/* Staff Selection */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="staff-select" className="mb-2 block">Select Staff Member</Label>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                        <SelectTrigger id="staff-select" className="w-full">
                            <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Staff</SelectItem>
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

                        <div className="grid md:grid-cols-2 gap-6">
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

                            <div className="space-y-2">
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
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6"
                            onClick={handleAddSlot}
                            disabled={isSubmitting || newSlot.days.length === 0}
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
                    </CardContent>
                </Card>
            )}

            {/* Current Availability Slots */}
            <div className="space-y-3">
                <h3 className="text-lg font-medium">Current Availability</h3>

                {filteredSlots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        {selectedStaff ? "No availability set for this staff member." : "No availability set."}
                    </div>
                ) : (
                    filteredSlots.map((slot) => {
                        const staff = staffMembers.find(s => s.id === slot.staffId);

                        return (
                            <Card key={slot.id} className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <div>
                                            <p className="font-medium">{staff?.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {slot.startTime} - {slot.endTime}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">Edit</Button>
                                            <Button variant="destructive" size="sm">Delete</Button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm mb-2">Available on:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {slot.days.map((day) => (
                                                <Badge key={day} variant="outline">
                                                    {weekdays.find(w => w.value === day)?.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
} 