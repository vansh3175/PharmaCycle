import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../../lib/mongodb';
import Pharmacy from '../../../models/Pharmacy';
import Disposal from '../../../models/Disposal';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

// Helper to authenticate and get user ID
async function getUserIdFromToken(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

/**
 * Finds nearby pharmacies using a geospatial query.
 * Path: GET /api/pharmacies/nearby?lat=...&lng=...
 */
async function findNearby(req) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const radius = 10000; // 10km radius for better results

    if (isNaN(lat) || isNaN(lng)) {
        return NextResponse.json({ message: 'Valid latitude and longitude are required.' }, { status: 400 });
    }

    try {
        await connectToDB();

        // This uses the '2dsphere' index you defined in your Pharmacy model
        const pharmacies = await Pharmacy.find({
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lng, lat] },
                    $maxDistance: radius
                }
            }
        }).limit(10).lean(); // Get up to 10 nearby locations

        return NextResponse.json(pharmacies, { status: 200 });

    } catch (error) {
        console.error('PHARMACY_NEARBY_ERROR', error);
        return NextResponse.json({ message: 'Failed to find nearby pharmacies.' }, { status: 500 });
    }
}


/**
 * Assigns a selected pharmacy to a pending disposal.
 * Path: POST /api/pharmacies/assign
 */
async function assignPharmacy(req) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        const { disposalCode, pharmacyId } = await req.json();

        if (!disposalCode || !pharmacyId) {
            return NextResponse.json({ message: 'Disposal code and Pharmacy ID are required.' }, { status: 400 });
        }

        await connectToDB();

        // Find the disposal and ensure it belongs to the current user and is pending
        const disposal = await Disposal.findOne({ disposalCode, user: userId, status: 'Pending' });
        if (!disposal) {
            return NextResponse.json({ message: 'Disposal not found or you do not have permission to edit it.' }, { status: 404 });
        }
        
        // Update the disposal document with the pharmacy's ID
        disposal.pharmacy = pharmacyId;
        await disposal.save();

        return NextResponse.json({ message: 'Drop-off point confirmed successfully! You can now visit the pharmacy.' }, { status: 200 });

    } catch (error) {
        console.error('PHARMACY_ASSIGN_ERROR', error);
        return NextResponse.json({ message: 'Failed to assign pharmacy.' }, { status: 500 });
    }
}


// --- Main Route Dispatcher ---
export async function GET(req, { params }) {
    if (params.action === 'nearby') return findNearby(req);
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}

export async function POST(req, { params }) {
    if (params.action === 'assign') return assignPharmacy(req);
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}
