"use client";

import { Button } from "@/app/components/ui/button";
import { Briefcase, Calendar, Clock, LayoutDashboard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    {
        title: "Dashboard",
        icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
        path: "/admin"
    },
    {
        title: "Appointments",
        icon: <Calendar className="mr-2 h-5 w-5" />,
        path: "/admin/appointments"
    },
    {
        title: "Availability",
        icon: <Clock className="mr-2 h-5 w-5" />,
        path: "/admin/availability"
    },
    {
        title: "Services",
        icon: <Briefcase className="mr-2 h-5 w-5" />,
        path: "/admin/services"
    },
    {
        title: "Staff",
        icon: <Users className="mr-2 h-5 w-5" />,
        path: "/admin/staff"
    },
    {
        title: "Settings",
        icon: <Settings className="mr-2 h-5 w-5" />,
        path: "/admin/settings"
    }
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen border-r bg-muted/30 p-6 hidden md:block">
            <div className="flex flex-col justify-between h-full">
                <div className="space-y-6">
                    <h2 className="text-lg font-bold mb-6">Elegant Nails Admin</h2>

                    <nav className="space-y-2">
                        {menuItems.map((item) => (
                            <Button
                                key={item.path}
                                variant={pathname === item.path ? "default" : "ghost"}
                                className={`w-full justify-start ${pathname === item.path ? "" : "hover:bg-muted"}`}
                                asChild
                            >
                                <Link href={item.path}>
                                    {item.icon}
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </div>

                <div className="pt-6 border-t">
                    <div className="rounded-lg bg-primary/10 p-4">
                        <h3 className="font-medium mb-1 text-sm">Need Help?</h3>
                        <p className="text-xs text-muted-foreground mb-3">
                            Check our admin documentation for guides and support.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                        >
                            <Link href="/admin/help">
                                View Documentation
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 