import { NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongodb';
import Disposal from '../../../models/Disposal';
import { enrichDisposal } from '../../../lib/enrichment';
import mongoose from 'mongoose';



// A helper to parse date ranges from the request
function getDateRange(req) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') ? new Date(searchParams.get('from')) : new Date('2020-01-01');
    const to = searchParams.get('to') ? new Date(searchParams.get('to')) : new Date();
    return { from, to };
}


/**
 * Generates data for the disposal heatmap.
 * GROUPS BY PHARMACY NAME AND CITY instead of raw coordinates.
 * Path: GET /api/analytics/heatmap?from=...&to=...
 */

async function getHeatmapData(req) {
    try {
        const { from, to } = getDateRange(req);
        await connectToDB();

        const heatmapData = await Disposal.aggregate([
            { $match: { status: "Completed", createdAt: { $gte: from, $lte: to } } },
            { $lookup: { from: "pharmacies", localField: "pharmacy", foreignField: "_id", as: "pharmacyDetails" }},
            { $unwind: "$pharmacyDetails" },
            { $group: {
                _id: "$pharmacyDetails._id", // Group by the unique pharmacy ID
                name: { $first: "$pharmacyDetails.name" }, // Get the pharmacy name
                city: { $first: "$pharmacyDetails.city" },   // Get the city
                count: { $sum: 1 } // Sum the disposals for that pharmacy
            }},
            { $sort: { count: -1 } }, // Sort to show the busiest pharmacies first
            { $project: {
                _id: 0,
                name: 1,
                city: 1,
                count: 1
            }}
        ]);

        return NextResponse.json(heatmapData, { status: 200 });
    } catch (error) {
        console.error("Heatmap API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


/**
 * Generates time-series data for disposals by category.
 * Path: GET /api/analytics/timeseries?from=...&to=...
 */
async function getTimeSeriesData(req) {
    try {
        const { from, to } = getDateRange(req);
        await connectToDB();
        
        const rawDisposals = await Disposal.find({ status: "Completed", createdAt: { $gte: from, $lte: to } })
            .select("createdAt items")
            .lean();

        const enrichedDisposals = rawDisposals.map(enrichDisposal);

        const byDayCategory = {};
        for (const disposal of enrichedDisposals) {
            const day = new Date(disposal.createdAt).toISOString().slice(0, 10);
            for (const item of disposal.items) {
                const category = item.category || "Uncategorized";
                byDayCategory[day] = byDayCategory[day] || {};
                byDayCategory[day][category] = (byDayCategory[day][category] || 0) + (item.qty || 1);
            }
        }
        return NextResponse.json(byDayCategory, { status: 200 });
    } catch (error) {
        console.error("Time Series API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * Generates total disposal counts by manufacturer for EPR reports.
 * Path: GET /api/analytics/manufacturers?from=...&to=...
 */
async function getManufacturerData(req) {
    try {
        const { from, to } = getDateRange(req);
        await connectToDB();

        const rawDisposals = await Disposal.find({ status: "Completed", createdAt: { $gte: from, $lte: to } })
            .select("items")
            .lean();
            
        const enrichedDisposals = rawDisposals.map(enrichDisposal);

        const manufacturerTotals = {};
        for (const disposal of enrichedDisposals) {
            for (const item of disposal.items) {
                if (item.manufacturer) {
                    manufacturerTotals[item.manufacturer] = (manufacturerTotals[item.manufacturer] || 0) + (item.qty || 1);
                }
            }
        }
        return NextResponse.json(manufacturerTotals, { status: 200 });
    } catch (error) {
        console.error("Manufacturer API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}


// --- Main Route Dispatcher ---
export async function GET(req, { params }) {
    const { action } = params;
    switch (action) {
        case 'heatmap': return getHeatmapData(req);
        case 'timeseries': return getTimeSeriesData(req);
        case 'manufacturers': return getManufacturerData(req);
        default: return NextResponse.json({ message: 'Not Found' }, { status: 404 });
    }
}

