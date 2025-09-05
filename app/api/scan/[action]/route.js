import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDB } from '../../../lib/mongodb';
import User from '../../../models/User';
import Disposal from '../../../models/Disposal';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-super-secret-key';

// Helper to get User ID from token
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
 * Analyzes a medicine image using the Gemini AI model.
 * The GEMINI_API_KEY is read from your .env.local file on the server.
 * Path: POST /api/scan/analyze
 */
async function handleAnalyze(req) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        const { imageBase64 } = await req.json();
        if (!imageBase64) {
            return NextResponse.json({ message: 'Image data is required.' }, { status: 400 });
        }
        
        // --- FIX ---
        // Explicitly read the API key from your .env.local file.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
        }
        // --- END FIX ---
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const prompt = `
            You are an expert AI for Pharma-Cycle, a medical waste disposal app. 
            Analyze the following image of a medicine package.
            Extract the following fields and return them as a single, clean JSON object:
            - "name": The full name of the medicine, including dosage (e.g., "Paracetamol 500mg").
            - "brand": The brand name (e.g., "Crocin").
            - "type": The form of the medicine (e.g., "Tablet", "Syrup", "Strip", "Bottle").
            - "expiryDate": The expiry date in YYYY-MM-DD format. If not visible, use null.
            - "category": A likely medical category (e.g., "Pain Relief", "Antibiotic", "Antihistamine").
            
            If a field is not clearly visible, its value should be null.
            Do not include any text or markdown formatting outside of the JSON object.
        `;

        const payload = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: imageBase64.split(',')[1] // Remove the data URI prefix
                            }
                        }
                    ]
                }
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Gemini API Error:", errorBody);
            throw new Error(`AI model failed with status: ${response.status}`);
        }

        const result = await response.json();
        const textResponse = result.candidates[0].content.parts[0].text;
        
        const jsonString = textResponse.replace(/```json|```/g, '').trim();
        const medicineData = JSON.parse(jsonString);

        return NextResponse.json(medicineData, { status: 200 });

    } catch (error) {
        console.error('SCAN_ANALYZE_ERROR', error);
        return NextResponse.json({ message: 'Failed to analyze image: ' + error.message }, { status: 500 });
    }
}

/**
 * Creates a new pending disposal record in the database.
 * Path: POST /api/scan/create
 */
async function handleCreate(req) {
    const userId = await getUserIdFromToken(req);
    if (!userId) {
        return NextResponse.json({ message: 'Authentication failed.' }, { status: 401 });
    }

    try {
        const { medicineData, quantity } = await req.json();
        
        await connectToDB();

        const disposalCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newDisposal = new Disposal({
            user: userId,
            items: [{
                medicineName: medicineData.name,
                qty: quantity,
                unit: medicineData.type ? medicineData.type.toLowerCase() : 'other',
                expiryDate: medicineData.expiryDate,
                aiConfidence: medicineData.confidence,
            }],
            status: 'Pending',
            disposalCode: disposalCode
        });

        await newDisposal.save();

        return NextResponse.json({ 
            message: 'Disposal pass created successfully!', 
            disposalCode: newDisposal.disposalCode,
            disposalId: newDisposal._id
        }, { status: 201 });

    } catch (error) {
         console.error('SCAN_CREATE_ERROR', error);
        return NextResponse.json({ message: 'Failed to create disposal pass.' }, { status: 500 });
    }
}


// --- Main Route Dispatcher ---
export async function POST(req, { params }) {
    const { action } = params;
    if (action === 'analyze') return handleAnalyze(req);
    if (action === 'create') return handleCreate(req);
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}

