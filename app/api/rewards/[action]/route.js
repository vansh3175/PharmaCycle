import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Coupon from '../../../models/Coupon';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

// Helper function to authenticate and get user
async function authenticate(req) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await connectToDB();
        const user = await User.findById(decoded.userId);
        return user;
    } catch (error) {
        return null;
    }
}

/**
 * Fetches all data needed for the Rewards Page.
 * - All active coupons
 * - The user's current points and their redeemed coupons.
 * Path: GET /api/rewards/data
 */
async function getRewardsData(req) {
    const user = await authenticate(req);
    if (!user) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        // Fetch all active, non-expired coupons
        const availableRewards = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: new Date() }
        }).lean(); // .lean() for plain JS objects

        // Fetch user's coupons and populate the details
        const userWithCoupons = await User.findById(user._id).populate('coupons').select('points coupons');

        // Create a set of user's coupon IDs for quick lookup
        const userCouponIds = new Set(userWithCoupons.coupons.map(c => c._id.toString()));

        return NextResponse.json({
            userPoints: userWithCoupons.points,
            availableRewards,
            myRewards: userWithCoupons.coupons,
            userCouponIds: Array.from(userCouponIds) // Send as array
        }, { status: 200 });

    } catch (error) {
        console.error('REWARDS_DATA_API_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


/**
 * Handles a user's request to redeem a coupon.
 * Path: POST /api/rewards/redeem
 */
async function redeemReward(req) {
     const user = await authenticate(req);
    if (!user) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        const { couponId } = await req.json();
        if (!couponId || !mongoose.Types.ObjectId.isValid(couponId)) {
            return NextResponse.json({ message: 'Valid Coupon ID is required.' }, { status: 400 });
        }

        const coupon = await Coupon.findById(couponId);

        // --- Validation Checks ---
        if (!coupon || !coupon.isActive) {
            return NextResponse.json({ message: 'This reward is not available.' }, { status: 404 });
        }
        if (user.points < coupon.pointsRequired) {
            return NextResponse.json({ message: 'You do not have enough points for this reward.' }, { status: 403 });
        }
        if (user.coupons.includes(couponId)) {
             return NextResponse.json({ message: 'You have already redeemed this reward.' }, { status: 409 });
        }

        // --- Perform Redemption ---
        user.points -= coupon.pointsRequired;
        user.coupons.push(couponId);
        await user.save(); // This transaction is atomic for a single document

        return NextResponse.json({ message: `Successfully redeemed "${coupon.title}"!` }, { status: 200 });

    } catch (error) {
        console.error('REDEEM_REWARD_API_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}


// --- Main Route Dispatcher ---
export async function GET(req, { params }) {
    if (params.action === 'data') {
        return getRewardsData(req);
    }
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}

export async function POST(req, { params }) {
    if (params.action === 'redeem') {
        return redeemReward(req);
    }
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}
