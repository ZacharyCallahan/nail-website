"use client";

import { Avatar } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/app/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/app/components/ui/table";
import { Textarea } from "@/app/components/ui/textarea";
import { AlertCircle, Edit, Loader2, Plus, Trash2, User } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function StaffManager() {
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        email: "",
        phone: "",
        password: "",
        bio: "",
        services: [],
        isActive: true,
    });

    // Fetch staff and services data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/admin/staff');

                if (!response.ok) {
                    throw new Error('Failed to fetch staff data');
                }

                const data = await response.json();
                setStaff(data.staffMembers);
                setServices(data.services);
                setError(null);
            } catch (err) {
                console.error("Error fetching staff:", err);
                setError("Failed to load staff data. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => {
            if (prev.services.includes(serviceId)) {
                return { ...prev, services: prev.services.filter(id => id !== serviceId) };
            } else {
                return { ...prev, services: [...prev.services, serviceId] };
            }
        });
    };

    // Open dialog for adding a new staff member
    const handleAddStaff = () => {
        setCurrentStaff(null);
        setFormData({
            id: null,
            name: "",
            email: "",
            phone: "",
            password: "",
            bio: "",
            services: [],
            isActive: true,
        });
        setIsDialogOpen(true);
    };

    // Open dialog for editing an existing staff member
    const handleEditStaff = (staffMember) => {
        const serviceIds = staffMember.services.map(s => s.serviceId);

        setCurrentStaff(staffMember);
        setFormData({
            id: staffMember.id,
            name: staffMember.user.name,
            email: staffMember.user.email,
            phone: staffMember.user.phone || "",
            password: "", // Don't populate password for security
            bio: staffMember.bio || "",
            services: serviceIds,
            isActive: staffMember.isActive,
        });
        setIsDialogOpen(true);
    };

    // Open dialog for deleting staff
    const handleDeleteClick = (staffMember) => {
        setCurrentStaff(staffMember);
        setIsDeleteDialogOpen(true);
    };

    // Submit form to create or update staff
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError(null);

            const isUpdating = !!formData.id;
            const url = '/api/admin/staff';
            const method = isUpdating ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save staff member');
            }

            const data = await response.json();

            // Update the staff list
            if (isUpdating) {
                setStaff(prev => prev.map(s => s.id === data.staff.id ? data.staff : s));
            } else {
                setStaff(prev => [...prev, data.staff]);
            }

            // Close the dialog
            setIsDialogOpen(false);
        } catch (err) {
            console.error("Error saving staff:", err);
            setError(err.message || "Failed to save staff member. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle staff deletion
    const handleDeleteStaff = async () => {
        if (!currentStaff) return;

        try {
            setIsSubmitting(true);

            const response = await fetch(`/api/admin/staff?id=${currentStaff.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete staff member');
            }

            // Remove from staff list
            setStaff(prev => prev.filter(s => s.id !== currentStaff.id));

            // Close the dialog
            setIsDeleteDialogOpen(false);
        } catch (err) {
            console.error("Error deleting staff:", err);
            setError(err.message || "Failed to delete staff member. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex">
            <AdminSidebar />

            <div className="flex-1 p-8 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
                    <p className="text-muted-foreground">
                        Add, edit, or remove staff members and manage their service offerings.
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-md flex items-start">
                        <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Staff Members</h2>
                    <Button onClick={handleAddStaff}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff Member
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading staff data...</p>
                    </div>
                ) : staff.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center">
                            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-2">No staff members found</p>
                            <Button onClick={handleAddStaff} variant="outline">
                                Add Your First Staff Member
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Services</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staff.map(staffMember => (
                                    <TableRow key={staffMember.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 relative">
                                                    {staffMember.imageUrl ? (
                                                        <img src={staffMember.imageUrl} alt={staffMember.user.name} />
                                                    ) : (
                                                        <User className="h-5 w-5 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2" />
                                                    )}
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{staffMember.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{staffMember.user.phone || "No phone"}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{staffMember.user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {staffMember.services.slice(0, 2).map(service => (
                                                    <span
                                                        key={service.serviceId}
                                                        className="inline-flex text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5"
                                                    >
                                                        {service.service.name}
                                                    </span>
                                                ))}
                                                {staffMember.services.length > 2 && (
                                                    <span className="inline-flex text-xs bg-muted rounded-full px-2 py-0.5">
                                                        +{staffMember.services.length - 2} more
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex rounded-full px-2 py-1 text-xs ${staffMember.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {staffMember.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditStaff(staffMember)}
                                                >
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(staffMember)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Add/Edit Staff Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {formData.id ? `Edit Staff: ${formData.name}` : "Add New Staff Member"}
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={!!formData.id} // Can't change email for existing staff
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="password">
                                        {formData.id ? "New Password (leave blank to keep unchanged)" : "Password"}
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required={!formData.id} // Only required for new staff
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Staff bio or description"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label>Status</Label>
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="isActive"
                                            checked={formData.isActive}
                                            onCheckedChange={(checked) => {
                                                setFormData(prev => ({ ...prev, isActive: checked }));
                                            }}
                                        />
                                        <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    <Label>Services Offered</Label>
                                    <div className="border rounded-md p-3 h-48 overflow-y-auto">
                                        <div className="grid grid-cols-1 gap-2">
                                            {services.map(service => (
                                                <div key={service.id} className="flex items-center gap-2">
                                                    <Checkbox
                                                        id={`service-${service.id}`}
                                                        checked={formData.services.includes(service.id)}
                                                        onCheckedChange={() => handleServiceToggle(service.id)}
                                                    />
                                                    <Label htmlFor={`service-${service.id}`} className="cursor-pointer">
                                                        {service.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
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
                                    ) : formData.id ? "Update Staff" : "Add Staff"}
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
                                Delete Staff Member
                            </DialogTitle>
                        </DialogHeader>

                        <div className="py-4">
                            <p className="mb-2">Are you sure you want to delete this staff member?</p>
                            {currentStaff && (
                                <p className="font-medium">{currentStaff.user.name} ({currentStaff.user.email})</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                                This action cannot be undone. This will permanently delete the staff member's account and all associated data.
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
                                onClick={handleDeleteStaff}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : "Delete Staff"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
} 