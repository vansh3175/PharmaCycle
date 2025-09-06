import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../lib/mongodb'; // Assuming this is now at app/lib/mongodb
import User from '../../models/User';
import Disposal from '../../models/Disposal';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

/**
 * Fetches all necessary data for the user dashboard.
 * - User's name and points
 * - Total number of disposals
 * - Recent disposal history
 * Path: GET /api/dashboard
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

        // 2. Fetch the user's profile (excluding password)
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        // 3. Fetch the user's disposal history
        const disposals = await Disposal.find({ user: decoded.userId })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .limit(5) // Get the last 5 for the "Recent Activity" feed
            .populate('pharmacy', 'name address city'); // Add pharmacy details

        // 3.1. Fetch pending disposals separately
        const pendingDisposals = await Disposal.find({ 
            user: decoded.userId, 
            status: 'Pending' 
        })
            .sort({ createdAt: -1 })
            .populate('pharmacy', 'name address city');

        // 4. Get the total count of disposals and completed disposals
        const totalDisposals = await Disposal.countDocuments({ user: decoded.userId });
        const completedDisposals = await Disposal.countDocuments({ user: decoded.userId, status: 'Completed' });

        // 5. Calculate Environmental Impact (example calculation)
        // Let's assume each disposal saves ~0.7kg of CO2 on average
        const environmentImpact = (totalDisposals * 0.7).toFixed(1);

        // 6. Assemble the response payload
        const dashboardData = {
            user: {
                name: user.name,
                points: user.points,
            },
            stats: {
                totalDisposals: totalDisposals,
                completedDisposals: completedDisposals,
                pointsEarned: user.points,
                environmentImpact: environmentImpact,
            },
            recentActivity: disposals,
            pendingDisposals: pendingDisposals,
        };

        return NextResponse.json(dashboardData, { status: 200 });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ message: 'Invalid or expired token.' }, { status: 401 });
        }
        console.error('DASHBOARD_API_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}