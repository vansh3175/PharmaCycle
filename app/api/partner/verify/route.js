import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../../lib/mongodb';
import Disposal from '../../../models/Disposal';
import User from '../../../models/User';
import Pharmacy from '../../../models/Pharmacy';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

/**
 * Verify a disposal code and get disposal details
 * Path: POST /api/partner/verify
 */
export async function POST(req) {
    try {
        await connectToDB();

        const { disposalCode } = await req.json();

        if (!disposalCode) {
            return NextResponse.json({ 
                message: 'Disposal code is required' 
            }, { status: 400 });
        }

        // Find the disposal by code
        const disposal = await Disposal.findOne({ disposalCode: disposalCode.toUpperCase() })
            .populate('user', 'name email')
            .populate('pharmacy', 'name address');

        if (!disposal) {
            return NextResponse.json({ 
                message: 'Invalid disposal code' 
            }, { status: 404 });
        }

        // Check if already completed
        if (disposal.status === 'Completed') {
            return NextResponse.json({ 
                message: 'This disposal has already been completed',
                disposal: disposal
            }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Disposal found',
            disposal: disposal
        }, { status: 200 });

    } catch (error) {
        console.error('PARTNER_VERIFY_API_ERROR:', error);
        return NextResponse.json({ 
            message: 'An internal server error occurred.',
            error: error.message 
        }, { status: 500 });
    }
}

/**
 * Complete a disposal
 * Path: PUT /api/partner/verify
 */
export async function PUT(req) {
    try {
        await connectToDB();

        const { disposalCode, pharmacyCode } = await req.json();

        if (!disposalCode) {
            return NextResponse.json({ 
                message: 'Disposal code is required' 
            }, { status: 400 });
        }

        // Find the disposal
        const disposal = await Disposal.findOne({ disposalCode: disposalCode.toUpperCase() });

        if (!disposal) {
            return NextResponse.json({ 
                message: 'Invalid disposal code' 
            }, { status: 404 });
        }

        if (disposal.status === 'Completed') {
            return NextResponse.json({ 
                message: 'This disposal has already been completed' 
            }, { status: 400 });
        }

        // Update disposal status to completed
        disposal.status = 'Completed';
        disposal.completedAt = new Date();
        await disposal.save();

        // Add bonus points to user for completed disposal
        const bonusPoints = disposal.items.length * 5; // 5 bonus points per item
        await User.findByIdAndUpdate(disposal.user, {
            $inc: { points: bonusPoints }
        });

        // Update pharmacy's disposal count
        if (disposal.pharmacy) {
            await Pharmacy.findByIdAndUpdate(disposal.pharmacy, {
                $inc: { disposalsVerified: 1 }
            });
        }

        // Get updated disposal with populated fields
        const updatedDisposal = await Disposal.findById(disposal._id)
            .populate('user', 'name email')
            .populate('pharmacy', 'name address');

        return NextResponse.json({
            message: 'Disposal completed successfully',
            disposal: updatedDisposal,
            bonusPoints: bonusPoints
        }, { status: 200 });

    } catch (error) {
        console.error('PARTNER_COMPLETE_API_ERROR:', error);
        return NextResponse.json({ 
            message: 'An internal server error occurred.',
            error: error.message 
        }, { status: 500 });
    }
}
