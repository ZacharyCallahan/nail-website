"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Label } from "@/app/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/app/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function ServiceSelection({ selectedService, selectedAddOns, onServiceSelect, onAddOnsChange }) {
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

    // Fetch services from the API
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/services');

                if (!response.ok) {
                    throw new Error('Failed to fetch services');
                }

                const data = await response.json();
                console.log("Services fetched:", data.services.length);

                if (data.services.length === 0) {
                    setError("No services available. Please try again later.");
                } else {
                    setServices(data.services);
                    setCategories(data.categories);
                    setFilteredServices(data.services);
                    setError(null);
                }
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Failed to load services. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Filter services when category changes
    useEffect(() => {
        if (category === "all-categories") {
            setFilteredServices(services);
        } else if (category) {
            const filtered = services.filter(service => service.category === category);
            setFilteredServices(filtered);

            if (filtered.length === 0) {
                setError(`No services found in the "${category}" category.`);
            } else {
                setError(null);
            }
        } else {
            setFilteredServices(services);
        }
    }, [category, services]);

    const handleCategoryChange = (value) => {
        setCategory(value);
    };

    const handleServiceClick = (service) => {
        console.log("Service clicked:", service);
        setIsSelecting(true);

        try {
            console.log("About to call onServiceSelect with:", service);
            onServiceSelect(service);
            // Reset any previously selected add-ons when a new service is selected
            onAddOnsChange([]);

            // Show success message when service is selected
            setError(null);
        } catch (err) {
            console.error("Error selecting service:", err);
            setError("There was a problem selecting this service. Please try again.");
        } finally {
            setIsSelecting(false);
        }
    };

    const handleAddOnToggle = (addOn) => {
        if (!selectedAddOns) return;

        if (selectedAddOns.some(selected => selected.id === addOn.id)) {
            onAddOnsChange(selectedAddOns.filter(selected => selected.id !== addOn.id));
        } else {
            onAddOnsChange([...selectedAddOns, addOn]);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            {selectedService && !error && (
                <div className="bg-green-50 text-green-800 p-4 rounded-md flex items-start">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                    <p>You've selected <strong>{selectedService.name}</strong>. You can continue to the next step or choose a different service.</p>
                </div>
            )}

            {/* Category filter */}
            <div>
                <Label htmlFor="category" className="mb-2 block">Filter by Category</Label>
                <Select value={category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category" className="w-full max-w-xs">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-categories">All Categories</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Services list */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Select a Service</h3>

                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading services...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No services found in this category.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {filteredServices.map((service) => (
                            <Card
                                key={service.id}
                                className={`transition-all border-2 ${selectedService && selectedService.id === service.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-muted hover:border-muted-foreground/50'
                                    }`}
                            >
                                <CardContent className="p-4 flex items-start gap-4 relative">
                                    {selectedService && selectedService.id === service.id && (
                                        <div className="absolute -top-2 -right-2 h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                                            <CheckCircle className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                                        {service.imageUrl ? (
                                            <Image
                                                src={service.imageUrl}
                                                alt={service.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <p className="text-xs text-muted-foreground">No image</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">{service.name}</h4>
                                        </div>

                                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>

                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm">
                                                {service.duration} min
                                            </span>
                                            <span className="font-medium">
                                                {formatCurrency(service.price)}
                                            </span>
                                        </div>

                                        {/* Simple direct button approach */}
                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                className={`w-full rounded-md py-2 px-4 text-center ${selectedService && selectedService.id === service.id
                                                    ? 'bg-primary text-white font-medium shadow'
                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                                                    }`}
                                                onClick={() => {
                                                    console.log("Direct button click for:", service);
                                                    onServiceSelect(service);
                                                }}
                                            >
                                                {selectedService && selectedService.id === service.id
                                                    ? "✓ Selected"
                                                    : "Select This Service"}
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add-ons section (shown only when a service is selected) */}
            {selectedService && selectedService.addOns && selectedService.addOns.length > 0 && (
                <div className="mt-8 border-t pt-6 space-y-4">
                    <h3 className="text-lg font-medium">Add-Ons (Optional)</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {selectedService.addOns.map((addOn) => (
                            <div
                                key={addOn.id}
                                className="flex items-start space-x-3 border rounded-md p-3"
                            >
                                <Checkbox
                                    id={`addon-${addOn.id}`}
                                    checked={selectedAddOns?.some(selected => selected.id === addOn.id)}
                                    onCheckedChange={() => handleAddOnToggle(addOn)}
                                />
                                <div className="flex-1">
                                    <label
                                        htmlFor={`addon-${addOn.id}`}
                                        className="font-medium text-sm cursor-pointer flex justify-between"
                                    >
                                        <span>{addOn.name}</span>
                                        <span>{formatCurrency(addOn.price)}</span>
                                    </label>
                                    <p className="text-xs text-muted-foreground mt-1">{addOn.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
} 