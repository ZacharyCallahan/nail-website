import AdminSidebar from "@/app/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 p-6 bg-muted/10 overflow-auto">
                {children}
            </main>
        </div>
    );
} 