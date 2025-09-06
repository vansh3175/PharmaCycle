import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../lib/mongodb';
import User from '../../models/User';
import Disposal from '../../models/Disposal';
import Pharmacy from '../../models/Pharmacy';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

/**
 * Create a new disposal record
 * Path: POST /api/disposal
 */
export async function POST(req) {
    try {
        // 1. Authenticate the user from the token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token is required.' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        await connectToDB();

        // 2. Verify user exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        // 3. Parse request body
        const { pharmacy, medicines, disposalCode, userLocation, status = "Pending" } = await req.json();

        if (!pharmacy || !medicines || !disposalCode || !Array.isArray(medicines) || medicines.length === 0) {
            return NextResponse.json({ 
                message: 'Missing required fields: pharmacy, medicines, disposalCode' 
            }, { status: 400 });
        }

        // 4. Find or create pharmacy record
        let pharmacyRecord = await Pharmacy.findOne({ name: pharmacy.name, address: pharmacy.address });
        if (!pharmacyRecord) {
            pharmacyRecord = new Pharmacy({
                name: pharmacy.name,
                address: pharmacy.address,
                phone: pharmacy.phone,
                rating: pharmacy.rating || 4.5,
                coordinates: pharmacy.coordinates || { lat: 0, lng: 0 }
            });
            await pharmacyRecord.save();
        }

        // 5. Transform medicines data to match schema
        const transformedItems = medicines.map(medicine => ({
            medicineName: medicine.name || medicine.medicineName || 'Unknown Medicine',
            category: medicine.type || medicine.category || 'other',
            qty: medicine.quantity || 1,
            unit: medicine.unit || 'other',
            sealed: medicine.sealed || false,
            expiryDate: medicine.expiryDate || null,
            aiConfidence: medicine.confidence || null
        }));

        // 6. Create disposal record
        const newDisposal = new Disposal({
            user: decoded.userId,
            pharmacy: pharmacyRecord._id,
            items: transformedItems,
            status: status,
            disposalCode: disposalCode,
            userLocation: userLocation
        });

        await newDisposal.save();

        // 7. Calculate and add points to user (only for pending disposals to avoid double counting)
        if (status === "Pending") {
            const pointsToAdd = transformedItems.length * 10; // 10 points per medicine item
            await User.findByIdAndUpdate(decoded.userId, {
                $inc: { points: pointsToAdd }
            });
        }

        // 8. Populate the response with pharmacy details
        const populatedDisposal = await Disposal.findById(newDisposal._id).populate('pharmacy', 'name address phone rating');

        return NextResponse.json({
            message: 'Disposal created successfully',
            disposal: populatedDisposal
        }, { status: 201 });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }
        console.error('DISPOSAL_API_ERROR:', error);
        return NextResponse.json({ 
            message: 'An internal server error occurred.',
            error: error.message 
        }, { status: 500 });
    }
}

/**
 * Get all disposals for the authenticated user
 * Path: GET /api/disposal
 */
export async function GET(req) {
    try {
        // 1. Authenticate the user from the token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token is required.' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        await connectToDB();

        // 2. Verify user exists
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        // 3. Fetch all disposals for this user
        const disposals = await Disposal.find({ user: decoded.userId })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .populate('pharmacy', 'name address phone rating city');

        return NextResponse.json(disposals, { status: 200 });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }
        console.error('DISPOSAL_GET_API_ERROR:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

/**
 * Update disposal status (for pharmacy verification)
 * Path: PUT /api/disposal
 */
export async function PUT(req) {
    try {
        // 1. Authenticate the user from the token
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Authentication token is required.' }, { status: 401 });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        await connectToDB();

        // 2. Parse request body
        const { disposalCode, status } = await req.json();

        if (!disposalCode || !status) {
            return NextResponse.json({ 
                message: 'Missing required fields: disposalCode, status' 
            }, { status: 400 });
        }

        // 3. Find and update the disposal
        const disposal = await Disposal.findOne({ disposalCode: disposalCode });
        if (!disposal) {
            return NextResponse.json({ message: 'Disposal not found.' }, { status: 404 });
        }

        // 4. Update status
        disposal.status = status;
        await disposal.save();

        // 5. If completed, add bonus points
        if (status === "Completed" && disposal.status !== "Completed") {
            const bonusPoints = disposal.items.length * 5; // 5 bonus points per item when completed
            await User.findByIdAndUpdate(disposal.user, {
                $inc: { points: bonusPoints }
            });
        }

        const updatedDisposal = await Disposal.findById(disposal._id).populate('pharmacy', 'name address phone rating');

        return NextResponse.json({
            message: 'Disposal updated successfully',
            disposal: updatedDisposal
        }, { status: 200 });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }
        console.error('DISPOSAL_PUT_API_ERROR:', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}