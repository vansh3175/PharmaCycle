import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../lib/mongodb';
import User from '../../models/User';
import Disposal from '../../models/Disposal';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

/**
 * Fetches the complete disposal history for the authenticated user.
 * Path: GET /api/history
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
            .populate('pharmacy', 'name city'); // Populate with pharmacy details

        return NextResponse.json(disposals, { status: 200 });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }
        console.error('HISTORY_API_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
