import { NextResponse } from 'next/server';
import { connectToDB } from '../../../lib/mongodb';
import Disposal from '../../../models/Disposal';
import { enrichDisposal } from '../../../lib/enrichment';

/**
 * A simple anomaly detection function based on the z-score.
 * It identifies points that are a certain number of standard deviations away from a rolling average.
 * @param {Array<{day: string, count: number}>} timeseries - The input data series.
 * @param {number} window - The number of previous days to calculate the baseline.
 * @param {number} zThreshold - The z-score threshold to trigger an alert.
 * @returns {Array<object>} A list of alert objects for any detected anomalies.
 */
function detectSpikes(timeseries, window = 14, zThreshold = 2.0) {
  const alerts = [];
  if (timeseries.length < window) return alerts;

  for (let i = window; i < timeseries.length; i++) {
    const history = timeseries.slice(i - window, i).map(x => x.count);
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const stdDev = Math.sqrt(history.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / history.length) || 1;
    
    const currentPoint = timeseries[i];
    const zScore = (currentPoint.count - mean) / stdDev;

    // Trigger an alert if the spike is statistically significant and meaningful in volume
    if (zScore >= zThreshold && currentPoint.count >= mean + Math.max(5, 0.3 * mean)) {
      alerts.push({
        day: currentPoint.day,
        count: currentPoint.count,
        mean: parseFloat(mean.toFixed(1)),
        zScore: parseFloat(zScore.toFixed(2)),
      });
    }
  }
  return alerts;
}

/**
 * Fetches and analyzes disposal data to find anomalous spikes in specific categories.
 * Path: GET /api/analytics/alerts?from=...&to=...
 */
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const from = new Date(searchParams.get('from'));
        const to = new Date(searchParams.get('to'));
        
        await connectToDB();

        // 1. Fetch all relevant raw data in the period
        const rawDisposals = await Disposal.find({ status: "Completed", createdAt: { $gte: from, $lte: to } })
            .select("createdAt items")
            .lean();

        const enrichedDisposals = rawDisposals.map(enrichDisposal);

        // 2. Group data by category and day
        const dataByCategory = {};
        for (const disposal of enrichedDisposals) {
            const day = new Date(disposal.createdAt).toISOString().slice(0, 10);
            for (const item of disposal.items) {
                const category = item.category || "Uncategorized";
                dataByCategory[category] = dataByCategory[category] || {};
                dataByCategory[category][day] = (dataByCategory[category][day] || 0) + (item.qty || 1);
            }
        }

        // 3. Run spike detection on key categories
        const allAlerts = [];
        const categoriesToMonitor = ["Cough Syrup", "Painkiller", "Antibiotic", "Antihistamine"];

        for (const category of categoriesToMonitor) {
            if (dataByCategory[category]) {
                const timeseries = Object.entries(dataByCategory[category])
                    .map(([day, count]) => ({ day, count }))
                    .sort((a, b) => new Date(a.day) - new Date(b.day));
                
                const spikes = detectSpikes(timeseries);
                if (spikes.length > 0) {
                    allAlerts.push({ category, spikes });
                }
            }
        }
        
        return NextResponse.json(allAlerts, { status: 200 });
    } catch (error) {
        console.error("Alerts API Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
