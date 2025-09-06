import { NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongodb';
import Disposal from '../../../models/Disposal';
import { enrichDisposal } from '../../../lib/enrichment';

async function getAnalyticsDataForPrompt(from, to) {
  await connectToDB();

  const rawDisposals = await Disposal.find({
    status: "Completed",
    createdAt: { $gte: from, $lte: to }
  })
    .select("createdAt items")
    .lean();

  const enrichedDisposals = rawDisposals.map(enrichDisposal);

  const manufacturerTotals = {};
  const categoryTotals = {};
  let totalDisposals = 0;

  for (const disposal of enrichedDisposals) {
    for (const item of disposal.items) {
      const qty = item.qty || 1;
      totalDisposals += qty;
      if (item.manufacturer) {
        manufacturerTotals[item.manufacturer] =
          (manufacturerTotals[item.manufacturer] || 0) + qty;
      }
      if (item.category) {
        categoryTotals[item.category] =
          (categoryTotals[item.category] || 0) + qty;
      }
    }
  }

  return {
    totalDisposals,
    topManufacturer:
      Object.entries(manufacturerTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A",
    topCategory:
      Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "N/A",
    dateRange: {
      from: from.toLocaleDateString(),
      to: to.toLocaleDateString(),
    },
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = new Date(searchParams.get("from"));
    const to = new Date(searchParams.get("to"));

    // 1. Get structured disposal data
    const data = await getAnalyticsDataForPrompt(from, to);

    // 2. JSON-only prompt for Gemini
    const prompt = `
You are a public health analyst. Based on the following data, respond ONLY with valid JSON in this format:

{
  "headline": "short, news-style headline",
  "insight": "1-2 sentence analysis of the data",
  "recommendation": "1-2 sentence recommendation for public health officials"
}

Data:
- Total Medicines Recycled: ${data.totalDisposals}
- Top Disposal Category: ${data.topCategory}
- Top Manufacturer by Disposed Volume: ${data.topManufacturer}
- Period: ${data.dateRange.from} to ${data.dateRange.to}
`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured.");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("AI model failed to respond.");

    const result = await response.json();
        const summaryText = result.candidates[0].content.parts[0].text.trim();

    // Clean Gemini response (remove ```json and ``` wrappers if present)
    const cleanedText = summaryText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let summaryJson;
    try {
      summaryJson = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Failed to parse Gemini response as JSON:", cleanedText);
      throw new Error("Invalid AI response format");
    }


    // 4. Return structured summary
    return NextResponse.json({ summary: summaryJson }, { status: 200 });
  } catch (error) {
    console.error("AI Summary API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
