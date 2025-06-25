import { Footer } from "./Footer";
import { Header } from "./Header";

export function MainLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
} 