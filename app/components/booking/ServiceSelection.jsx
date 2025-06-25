"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import { Check } from "lucide-react";
import { useState } from "react";

// Sample data - in a real app, this would come from an API or database
const services = [
    {
        id: "classic-manicure",
        title: "Classic Manicure",
        description: "A traditional manicure with nail shaping, cuticle care, hand massage, and polish.",
        price: "$25",
        duration: "30 min",
    },
    {
        id: "gel-manicure",
        title: "Gel Manicure",
        description: "Long-lasting gel polish application with nail shaping and cuticle care.",
        price: "$40",
        duration: "45 min",
    },
    {
        id: "classic-pedicure",
        title: "Classic Pedicure",
        description: "Relaxing foot soak, nail shaping, callus removal, foot massage, and polish.",
        price: "$40",
        duration: "45 min",
    },
    {
        id: "deluxe-pedicure",
        title: "Deluxe Pedicure",
        description: "Premium pedicure with exfoliating scrub, hydrating mask, extended massage, and polish.",
        price: "$55",
        duration: "60 min",
    },
    {
        id: "acrylic-full-set",
        title: "Acrylic Full Set",
        description: "Full set of acrylic nails with your choice of length and shape.",
        price: "$70",
        duration: "75 min",
    },
    {
        id: "gel-extensions",
        title: "Gel Extensions",
        description: "Full set of gel nail extensions for a natural look and feel.",
        price: "$80",
        duration: "90 min",
    },
];

const addOns = [
    {
        id: "french-tips",
        title: "French Tips",
        description: "Classic white tips for a timeless look.",
        price: "$10",
        duration: "10 min",
    },
    {
        id: "nail-art-simple",
        title: "Simple Nail Art",
        description: "Basic design on one or more nails.",
        price: "$15",
        duration: "15 min",
    },
    {
        id: "nail-strengthener",
        title: "Nail Strengthener",
        description: "Treatment to help strengthen brittle or weak nails.",
        price: "$8",
        duration: "5 min",
    },
    {
        id: "paraffin-treatment",
        title: "Paraffin Treatment",
        description: "Deeply moisturizing warm wax treatment for hands or feet.",
        price: "$15",
        duration: "15 min",
    },
];

export function ServiceSelection({ selectedService, selectedAddOns, onServiceSelect, onAddOnsChange }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleServiceClick = (service) => {
        onServiceSelect(service);
    };

    const handleAddOnToggle = (addOn) => {
        const currentAddOns = [...(selectedAddOns || [])];
        const index = currentAddOns.findIndex(item => item.id === addOn.id);

        if (index >= 0) {
            // Remove if already selected
            currentAddOns.splice(index, 1);
        } else {
            // Add if not selected
            currentAddOns.push(addOn);
        }

        onAddOnsChange(currentAddOns);
    };

    const isAddOnSelected = (id) => {
        return (selectedAddOns || []).some(addOn => addOn.id === id);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6">Select a Service</h2>

            {/* Search input */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
            </div>

            {/* Service cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {filteredServices.map((service) => (
                    <Card
                        key={service.id}
                        className={`cursor-pointer transition-all ${selectedService?.id === service.id
                                ? "ring-2 ring-primary"
                                : "hover:border-primary/50"
                            }`}
                        onClick={() => handleServiceClick(service)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{service.title}</CardTitle>
                                {selectedService?.id === service.id && (
                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white">
                                        <Check className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-primary">{service.price}</span>
                                <span className="text-muted-foreground">{service.duration}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{service.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedService && (
                <div>
                    <h3 className="text-xl font-semibold mb-4">Add-ons for {selectedService.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addOns.map((addOn) => (
                            <div
                                key={addOn.id}
                                className="flex items-start space-x-3 p-4 border rounded-md hover:bg-muted/50 transition-colors"
                            >
                                <Checkbox
                                    id={`addon-${addOn.id}`}
                                    checked={isAddOnSelected(addOn.id)}
                                    onCheckedChange={() => handleAddOnToggle(addOn)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <Label htmlFor={`addon-${addOn.id}`} className="font-medium">
                                            {addOn.title}
                                        </Label>
                                        <span className="text-primary font-medium">{addOn.price}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{addOn.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{addOn.duration}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 