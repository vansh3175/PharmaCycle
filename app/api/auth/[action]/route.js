import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../../lib/mongodb'; // Your database connection utility
import User from '../../../models/User'; // Your User model

// IMPORTANT: Store your JWT_SECRET in a .env.local file for security
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

/**
 * Handles new user registration.
 * Path: POST /api/auth/register
 */
async function handleRegister(req) {
  try {
    await connectToDB();
    const { name, email, password } = await req.json();

    // 1. Validate incoming data
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
    }

    // 2. Check if a user with that email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 409 });
    }

    // 3. Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Create a new user document in the database
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      // The 'points' field will default to 0 as defined in your UserSchema
    });
    await newUser.save();

    // 5. Generate a JSON Web Token (JWT) to log the user in automatically
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    return NextResponse.json({ message: 'Account created successfully!', token }, { status: 201 });
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

/**
 * Handles user login.
 * Path: POST /api/auth/login
 */
async function handleLogin(req) {
  try {
    await connectToDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // 1. Find the user by their email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
    }

    // 2. Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials. Please try again.' }, { status: 401 });
    }

    // 3. Generate a JWT for the user's session
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    return NextResponse.json({ message: 'Login successful!', token }, { status: 200 });
  } catch (error) {
    console.error('LOGIN_ERROR', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}

// --- Main Route Handler ---
// This function acts as a controller, directing incoming POST requests
// to the appropriate function (handleRegister or handleLogin) based on the URL.
export async function POST(req, { params }) {
  const { action } = params;

  if (action === 'register') {
    return handleRegister(req);
  } else if (action === 'login') {
    return handleLogin(req);
  }

  // If the action is neither 'login' nor 'register'
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}

