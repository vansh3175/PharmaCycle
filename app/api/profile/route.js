import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../lib/mongodb';
import User from '../../models/User';
import Disposal from '../../models/Disposal';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

// Helper function to authenticate and get user ID
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
 * Fetches the user's profile data and their statistics.
 * Path: GET /api/profile
 */
export async function GET(req) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        await connectToDB();
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }
        
        // Calculate stats
        const totalDisposals = await Disposal.countDocuments({ user: userId, status: 'Completed' });
        const co2Saved = (totalDisposals * 0.7).toFixed(1);
        const rank = totalDisposals >= 10 ? 'Eco Warrior' : 'Eco Starter';

        return NextResponse.json({
            profileData: {
                name: user.name,
                email: user.email,
                phone: user.phone || '', // Add phone/location to User model if needed
                location: user.location || '',
                joinDate: user.createdAt,
            },
            userStats: {
                totalDisposals,
                pointsEarned: user.points,
                co2Saved,
                rank,
            }
        }, { status: 200 });

    } catch (error) {
        console.error('PROFILE_GET_ERROR', error);
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}

/**
 * Updates the user's profile information.
 * Path: PUT /api/profile
 */
export async function PUT(req) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        const { name, email, phone, location } = await req.json();

        // Basic validation
        if (!name || !email) {
            return NextResponse.json({ message: 'Name and email are required.' }, { status: 400 });
        }

        await connectToDB();
        const updatedUser = await User.findByIdAndUpdate(userId, {
            name,
            email,
            phone,
            location
        }, { new: true }).select('-password'); // {new: true} returns the updated document

        if (!updatedUser) {
             return NextResponse.json({ message: 'User not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Profile updated successfully!', user: updatedUser }, { status: 200 });

    } catch (error) {
         console.error('PROFILE_UPDATE_ERROR', error);
         // Handle potential duplicate email error
         if (error.code === 11000) {
            return NextResponse.json({ message: 'This email is already in use by another account.' }, { status: 409 });
         }
        return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
    }
}
