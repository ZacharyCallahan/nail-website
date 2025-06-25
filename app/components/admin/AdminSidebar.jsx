"use client";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Calendar,
    CreditCard,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Scissors,
    Settings,
    Users
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        {
            name: "Dashboard",
            href: "/admin",
            icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
        },
        {
            name: "Appointments",
            href: "/admin/appointments",
            icon: <Calendar className="mr-2 h-5 w-5" />,
        },
        {
            name: "Staff",
            href: "/admin/staff",
            icon: <Users className="mr-2 h-5 w-5" />,
        },
        {
            name: "Services",
            href: "/admin/services",
            icon: <Scissors className="mr-2 h-5 w-5" />,
        },
        {
            name: "Payments",
            href: "/admin/payments",
            icon: <CreditCard className="mr-2 h-5 w-5" />,
        },
        {
            name: "Messages",
            href: "/admin/messages",
            icon: <MessageSquare className="mr-2 h-5 w-5" />,
        },
        {
            name: "Settings",
            href: "/admin/settings",
            icon: <Settings className="mr-2 h-5 w-5" />,
        },
    ];

    return (
        <div className="min-h-screen w-64 border-r bg-card flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary">Elegant Nails</h1>
                <p className="text-sm text-muted-foreground mt-1">Admin Portal</p>
            </div>

            <nav className="flex-1 px-4 pb-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center py-2 px-3 text-sm rounded-md",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Profile and Logout */}
            <div className="p-4 border-t">
                <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 mr-3"></div>
                    <div>
                        <p className="font-medium text-sm">Admin User</p>
                        <p className="text-xs text-muted-foreground">admin@example.com</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
} 