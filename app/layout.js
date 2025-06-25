import { Inter } from "next/font/google";
import { auth } from "./api/auth/[...nextauth]/route";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Elegant Nails | Premium Nail Salon",
  description: "Your destination for premium nail care and beauty services.",
};

export default async function RootLayout({ children }) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
