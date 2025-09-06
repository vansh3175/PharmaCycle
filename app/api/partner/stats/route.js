import { NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongodb';
import Disposal from '../../../models/Disposal';
import User from '../../../models/User';
import Pharmacy from '../../../models/Pharmacy';

/**
 * Get partner dashboard statistics
 * Path: GET /api/partner/stats
 */
export async function GET(req) {
    try {
        await connectToDB();

        // Get today's date range
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Get this month's date range
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

        // Get statistics
        const todayCount = await Disposal.countDocuments({
            status: 'Completed',
            completedAt: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });

        const monthCount = await Disposal.countDocuments({
            status: 'Completed',
            completedAt: {
                $gte: startOfMonth,
                $lt: startOfNextMonth
            }
        });

        const totalCount = await Disposal.countDocuments({
            status: 'Completed'
        });

        // Get recent disposals (last 10 completed)
        const recentDisposals = await Disposal.find({
            status: 'Completed'
        })
        .sort({ completedAt: -1 })
        .limit(10)
        .populate('user', 'name')
        .populate('pharmacy', 'name');

        // Calculate CO2 saved (0.7kg per disposal)
        const co2Saved = (todayCount * 0.7).toFixed(1);

        const stats = {
            todayCount,
            monthCount,
            totalCount,
            co2Saved: parseFloat(co2Saved),
            rating: 4.8, // This could be calculated from user feedback
            activeUsers: await User.countDocuments({
                updatedAt: {
                    $gte: startOfDay
                }
            })
        };

        return NextResponse.json({
            stats,
            recentDisposals
        }, { status: 200 });

    } catch (error) {
        console.error('PARTNER_STATS_API_ERROR:', error);
        return NextResponse.json({ 
            message: 'An internal server error occurred.',
            error: error.message 
        }, { status: 500 });
    }
}
