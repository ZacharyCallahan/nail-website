"use client";

import { useState } from "react";
import ServicesManager from "./ServicesManager";

export default function ServicesManagerWrapper() {
    const [error, setError] = useState(null);

    // Error boundary
    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-800 rounded-md">
                <h2 className="text-lg font-bold mb-2">Error Loading Services Manager</h2>
                <p className="mb-4">{error.message || "An unexpected error occurred"}</p>
                <button
                    className="px-4 py-2 bg-red-600 text-white rounded-md"
                    onClick={() => window.location.reload()}
                >
                    Reload Page
                </button>
            </div>
        );
    }

    try {
        return <ServicesManager />;
    } catch (err) {
        console.error("Error in ServicesManager:", err);
        setError(err);
        return null;
    }
} 