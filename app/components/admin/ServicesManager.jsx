"use client";

import AdminSidebar from "@/app/components/admin/AdminSidebar";
import { Button } from "@/app/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, Edit, ImageIcon, Loader2, Plus, Scissors, Trash2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
import { useEffect, useState } from "react";

export default function ServicesManager() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("services");

    const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
    const [isAddOnDialogOpen, setIsAddOnDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [currentAddOn, setCurrentAddOn] = useState(null);

    // Form state for services
    const [serviceForm, setServiceForm] = useState({
        id: null,
        name: "",
        description: "",
        duration: 30,
        price: "",
        category: "",
        imageUrl: "",
        isActive: true
    });

    // Form state for add-ons
    const [addOnForm, setAddOnForm] = useState({
        id: null,
        name: "",
        description: "",
        price: "",
        serviceId: "",
        isActive: true
    });

    // Fetch services data
    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/services?activeOnly=false');

                if (!response.ok) {
                    throw new Error('Failed to fetch services data');
                }

                const data = await response.json();
                setServices(data.services);
                setCategories(data.categories);
                setError(null);
            } catch (err) {
                console.error("Error fetching services:", err);
                setError("Failed to load services data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Handler for service form changes
    const handleServiceFormChange = (e) => {
        const { name, value } = e.target;

        // Handle price as number
        if (name === 'price' || name === 'duration') {
            const numValue = parseFloat(value);
            setServiceForm(prev => ({
                ...prev,
                [name]: name === 'duration' ? (isNaN(numValue) ? '' : Math.floor(numValue)) : value
            }));
        } else {
            setServiceForm(prev => ({ ...prev, [name]: value }));
        }
    };

    // Handler for add-on form changes
    const handleAddOnFormChange = (e) => {
        const { name, value } = e.target;
        setAddOnForm(prev => ({ ...prev, [name]: value }));
    };

    // Open dialog for adding a new service
    const handleAddService = () => {
        setCurrentService(null);
        setServiceForm({
            id: null,
            name: "",
            description: "",
            duration: 30,
            price: "",
            category: categories[0] || "",
            imageUrl: "",
            isActive: true
        });
        setIsServiceDialogOpen(true);
    };

    // Open dialog for editing an existing service
    const handleEditService = (service) => {
        setCurrentService(service);
        setServiceForm({
            id: service.id,
            name: service.name,
            description: service.description,
            duration: service.duration,
            price: service.price.toString(),
            category: service.category,
            imageUrl: service.imageUrl || "",
            isActive: service.isActive
        });
        setIsServiceDialogOpen(true);
    };

    // Open dialog for adding a new add-on
    const handleAddAddOn = (serviceId) => {
        const service = services.find(s => s.id === serviceId);

        setCurrentAddOn(null);
        setAddOnForm({
            id: null,
            name: "",
            description: "",
            price: "",
            serviceId: serviceId,
            isActive: true
        });
        setIsAddOnDialogOpen(true);
    };

    // Open dialog for editing an existing add-on
    const handleEditAddOn = (addOn, serviceId) => {
        setCurrentAddOn(addOn);
        setAddOnForm({
            id: addOn.id,
            name: addOn.name,
            description: addOn.description,
            price: addOn.price.toString(),
            serviceId: serviceId,
            isActive: addOn.isActive
        });
        setIsAddOnDialogOpen(true);
    };

    // Open dialog for deleting service or add-on
    const handleDeleteClick = (item, type) => {
        if (type === 'service') {
            setCurrentService(item);
            setCurrentAddOn(null);
        } else {
            setCurrentAddOn(item);
            setCurrentService(null);
        }
        setIsDeleteDialogOpen(true);
    };

    // Submit form to create or update service
    const handleServiceSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            // Format form data for API
            const serviceData = {
                ...serviceForm,
                price: parseFloat(serviceForm.price),
                duration: parseInt(serviceForm.duration)
            };

            const isUpdating = !!serviceForm.id;
            const url = '/api/admin/services';
            const method = isUpdating ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(serviceData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save service');
            }

            const data = await response.json();

            // Add the new category to the list if it's not already there
            if (!categories.includes(serviceData.category)) {
                setCategories(prev => [...prev, serviceData.category].sort());
            }

            // Update services list
            if (isUpdating) {
                setServices(prev => prev.map(s => s.id === data.service.id ? data.service : s));
            } else {
                setServices(prev => [...prev, data.service]);
            }

            // Close dialog
            setIsServiceDialogOpen(false);
        } catch (err) {
            console.error("Error saving service:", err);
            setError(err.message || "Failed to save service. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Submit form to create or update add-on
    const handleAddOnSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            // Format form data for API
            const addOnData = {
                ...addOnForm,
                price: parseFloat(addOnForm.price),
            };

            const isUpdating = !!addOnForm.id;
            const url = '/api/admin/addons';
            const method = isUpdating ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addOnData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save add-on');
            }

            const data = await response.json();

            // Update services with the new/updated add-on
            setServices(prev => {
                return prev.map(service => {
                    if (service.id === addOnData.serviceId) {
                        // Deep clone service to avoid modifying state directly
                        const updatedService = { ...service };

                        if (isUpdating) {
                            // Update existing add-on
                            updatedService.addOns = updatedService.addOns.map(addon =>
                                addon.id === data.addon.id ? data.addon : addon);
                        } else {
                            // Add new add-on
                            updatedService.addOns = [...updatedService.addOns, data.addon];
                        }

                        return updatedService;
                    }
                    return service;
                });
            });

            // Close dialog
            setIsAddOnDialogOpen(false);
        } catch (err) {
            console.error("Error saving add-on:", err);
            setError(err.message || "Failed to save add-on. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle deletion of service or add-on
    const handleDelete = async () => {
        try {
            setIsSubmitting(true);

            let url, entityId, entityType;

            if (currentService) {
                url = `/api/admin/services?id=${currentService.id}`;
                entityId = currentService.id;
                entityType = 'service';
            } else if (currentAddOn) {
                url = `/api/admin/addons?id=${currentAddOn.id}`;
                entityId = currentAddOn.id;
                entityType = 'addon';
            } else {
                throw new Error("No item selected for deletion");
            }

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete ${entityType}`);
            }

            // Update state based on what was deleted
            if (entityType === 'service') {
                setServices(prev => prev.filter(s => s.id !== entityId));
            } else {
                // Find which service contains this add-on and remove it
                setServices(prev => {
                    return prev.map(service => {
                        if (service.addOns.some(addon => addon.id === entityId)) {
                            return {
                                ...service,
                                addOns: service.addOns.filter(addon => addon.id !== entityId)
                            };
                        }
                        return service;
                    });
                });
            }

            // Close dialog
            setIsDeleteDialogOpen(false);
        } catch (err) {
            console.error("Error deleting item:", err);
            setError(err.message || "Failed to delete item. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex">

            <div className="flex-1 p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Services Management</h1>
                    <p className="text-muted-foreground">
                        Manage salon services, add-ons, prices, and descriptions.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex justify-between items-center">
                        <TabsList>
                            <TabsTrigger value="services">Services</TabsTrigger>
                            <TabsTrigger value="categories">Categories</TabsTrigger>
                        </TabsList>

                        <Button onClick={handleAddService}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Service
                        </Button>
                    </div>

                    <TabsContent value="services" className="pt-4">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                <p className="text-muted-foreground">Loading services data...</p>
                            </div>
                        ) : services.length === 0 ? (
                            <Card>
                                <CardContent className="py-10 text-center">
                                    <Scissors className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-2">No services found</p>
                                    <Button onClick={handleAddService} variant="outline">
                                        Add Your First Service
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {categories.map(category => (
                                    <div key={category} className="space-y-4">
                                        <h2 className="text-xl font-semibold">{category}</h2>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            {services
                                                .filter(service => service.category === category)
                                                .map(service => (
                                                    <Card key={service.id} className={!service.isActive ? "opacity-70" : ""}>
                                                        <CardContent className="p-0">
                                                            <div className="flex border-b">
                                                                <div className="w-1/3 relative h-40">
                                                                    {service.imageUrl ? (
                                                                        <Image
                                                                            src={service.imageUrl}
                                                                            alt={service.name}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full bg-muted flex items-center justify-center">
                                                                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 p-4">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h3 className="font-medium">{service.name}</h3>
                                                                        <span className="font-medium">
                                                                            {formatCurrency(service.price)}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                                                                        <span>{service.duration} min</span>
                                                                        {!service.isActive && (
                                                                            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                                                                                Inactive
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                                        {service.description}
                                                                    </p>

                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleEditService(service)}
                                                                        >
                                                                            <Edit className="h-4 w-4 mr-1" />
                                                                            Edit
                                                                        </Button>

                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteClick(service, 'service')}
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Add-ons section */}
                                                            <div className="p-4">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <h4 className="text-sm font-medium">Add-ons</h4>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleAddAddOn(service.id)}
                                                                    >
                                                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                                                        Add
                                                                    </Button>
                                                                </div>

                                                                {service.addOns && service.addOns.length > 0 ? (
                                                                    <div className="space-y-2">
                                                                        {service.addOns.map(addon => (
                                                                            <div
                                                                                key={addon.id}
                                                                                className={`flex justify-between items-center text-sm p-2 border rounded-md ${!addon.isActive ? 'opacity-70' : ''}`}
                                                                            >
                                                                                <div>
                                                                                    <span className="font-medium mr-1">{addon.name}</span>
                                                                                    {!addon.isActive && (
                                                                                        <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                                                                                            Inactive
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                <div className="flex items-center gap-3">
                                                                                    <span>{formatCurrency(addon.price)}</span>
                                                                                    <div className="flex gap-1">
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6"
                                                                                            onClick={() => handleEditAddOn(addon, service.id)}
                                                                                        >
                                                                                            <Edit className="h-3 w-3" />
                                                                                        </Button>

                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6 text-red-500"
                                                                                            onClick={() => handleDeleteClick(addon, 'addon')}
                                                                                        >
                                                                                            <Trash2 className="h-3 w-3" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-muted-foreground text-center py-2">
                                                                        No add-ons available for this service
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="categories" className="pt-4">
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Service Categories</h2>

                                {isLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                    </div>
                                ) : categories.length === 0 ? (
                                    <p className="text-muted-foreground text-center">No categories found</p>
                                ) : (
                                    <div className="space-y-2">
                                        {categories.map(category => (
                                            <div key={category} className="flex justify-between items-center p-3 border rounded-md">
                                                <span className="font-medium">{category}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {services.filter(service => service.category === category).length} services
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <p className="text-sm text-muted-foreground mt-4">
                                    Categories are automatically created when adding or editing services.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Service Dialog */}
                <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {serviceForm.id ? `Edit Service: ${serviceForm.name}` : "Add New Service"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleServiceSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="name">Service Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={serviceForm.name}
                                        onChange={handleServiceFormChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={serviceForm.description}
                                        onChange={handleServiceFormChange}
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="duration">Duration (minutes)</Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            type="number"
                                            min="5"
                                            step="5"
                                            value={serviceForm.duration}
                                            onChange={handleServiceFormChange}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={serviceForm.price}
                                            onChange={handleServiceFormChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        name="category"
                                        list="categories"
                                        value={serviceForm.category}
                                        onChange={handleServiceFormChange}
                                        required
                                        placeholder="Enter or select a category"
                                    />
                                    <datalist id="categories">
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} />
                                        ))}
                                    </datalist>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enter an existing category or create a new one
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="imageUrl">Image URL</Label>
                                    <Input
                                        id="imageUrl"
                                        name="imageUrl"
                                        type="url"
                                        value={serviceForm.imageUrl}
                                        onChange={handleServiceFormChange}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Optional. Enter a URL for the service image.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="isActive"
                                            checked={serviceForm.isActive}
                                            onCheckedChange={(checked) => {
                                                setServiceForm(prev => ({ ...prev, isActive: checked }));
                                            }}
                                        />
                                        <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Inactive services won&apos;t be shown to customers
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsServiceDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : serviceForm.id ? "Update Service" : "Add Service"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add-on Dialog */}
                <Dialog open={isAddOnDialogOpen} onOpenChange={setIsAddOnDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {addOnForm.id ? `Edit Add-on: ${addOnForm.name}` : "Add New Add-on"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleAddOnSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="addon-name">Name</Label>
                                    <Input
                                        id="addon-name"
                                        name="name"
                                        value={addOnForm.name}
                                        onChange={handleAddOnFormChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="addon-description">Description</Label>
                                    <Textarea
                                        id="addon-description"
                                        name="description"
                                        value={addOnForm.description}
                                        onChange={handleAddOnFormChange}
                                        rows={2}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="addon-price">Price ($)</Label>
                                    <Input
                                        id="addon-price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={addOnForm.price}
                                        onChange={handleAddOnFormChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="addon-isActive"
                                            checked={addOnForm.isActive}
                                            onCheckedChange={(checked) => {
                                                setAddOnForm(prev => ({ ...prev, isActive: checked }));
                                            }}
                                        />
                                        <Label htmlFor="addon-isActive" className="cursor-pointer">Active</Label>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddOnDialogOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : addOnForm.id ? "Update Add-on" : "Add Add-on"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">
                                Delete {currentService ? "Service" : "Add-on"}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <p className="mb-2">
                                Are you sure you want to delete this {currentService ? "service" : "add-on"}?
                            </p>

                            {currentService && (
                                <>
                                    <p className="font-medium">{currentService.name}</p>
                                    {currentService.addOns && currentService.addOns.length > 0 && (
                                        <p className="text-sm text-red-600 mt-2">
                                            Warning: This will also delete {currentService.addOns.length} associated add-ons.
                                        </p>
                                    )}
                                </>
                            )}

                            {currentAddOn && (
                                <p className="font-medium">{currentAddOn.name}</p>
                            )}

                            <p className="text-sm text-muted-foreground mt-2">
                                This action cannot be undone.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteDialogOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
} 