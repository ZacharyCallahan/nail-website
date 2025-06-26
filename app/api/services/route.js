import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get all services with add-ons
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const categoryFilter = searchParams.get('category');
        const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true
        const serviceId = searchParams.get('serviceId');

        console.log("Services API called with params:", { categoryFilter, activeOnly, serviceId });

        // If serviceId is provided, return only that specific service
        if (serviceId) {
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
                include: {
                    addOns: {
                        where: {
                            isActive: activeOnly ? true : undefined
                        }
                    },
                    staffServices: {
                        include: {
                            staff: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            image: true
                                        }
                                    },
                                    schedules: true
                                }
                            }
                        }
                    }
                }
            });

            if (!service) {
                return NextResponse.json({ error: "Service not found" }, { status: 404 });
            }

            console.log(`API returning single service: ${service.name}`);
            return NextResponse.json({ service });
        }

        // Build the where clause based on filters
        const whereClause = {
            isActive: activeOnly ? true : undefined,
            category: categoryFilter || undefined
        };

        // Remove undefined fields from whereClause
        Object.keys(whereClause).forEach(key =>
            whereClause[key] === undefined && delete whereClause[key]
        );

        // Fetch services with their add-ons
        const services = await prisma.service.findMany({
            where: whereClause,
            include: {
                addOns: {
                    where: {
                        isActive: activeOnly ? true : undefined
                    }
                },
                staffServices: {
                    include: {
                        staff: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        image: true
                                    }
                                },
                                schedules: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { category: 'asc' },
                { name: 'asc' }
            ]
        });

        // Get all unique categories for filtering
        const categories = await prisma.service.findMany({
            where: {
                isActive: activeOnly ? true : undefined
            },
            select: {
                category: true
            },
            distinct: ['category'],
            orderBy: {
                category: 'asc'
            }
        });

        console.log(`API returning ${services.length} services and ${categories.length} categories`);

        return NextResponse.json({
            services,
            categories: categories.map(c => c.category)
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
} 