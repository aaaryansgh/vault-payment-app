import * as paymentService from "./paymentService.js";
import OpenAI from "openai";
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

// Define structure for the summary data we'll send to the AI
interface SpendingSummaryForAI {
    timePeriod: string;
    totalSpent: number;
    spendingByCategory: Array<{ category: string; amount: number; percentage: number }>;
    spendingByVault: Array<{ vaultName: string; amount: number; percentageOfTotal: number }>;
    spendingTrend?: Array<{ date: string; amount: number }>; // Optional trend data
    // Add more fields if needed, e.g., comparison to previous period
}


export const summarizeSpendingData = async (userId: string): Promise<SpendingSummaryForAI | null> => {
    try {
        // Define the time period (e.g., last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 30); 

        const options = { userId, startDate, endDate };

        // Fetch data using existing paymentService functions
        const [categorySpending, vaultSpending, timeSeries] = await Promise.all([
            paymentService.getSpendingByCategory(options),
            paymentService.getSpendingByVault(options),
            paymentService.getSpendingOverTime({ ...options, granularity: 'day' })
        ]);

        // Calculate total spending for the period
        const totalSpent = categorySpending.reduce((sum, cat) => sum + cat.amount, 0);

        // Basic check if there's enough data to analyze
        if (totalSpent <= 0 || categorySpending.length === 0) {
            console.log(`No significant spending data for user ${userId} in the last 30 days.`);
            return null; // Not enough data for meaningful insights
        }

        // Format the data for the AI prompt
        const summary: SpendingSummaryForAI = {
            timePeriod: `Last 30 days (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()})`,
            totalSpent: parseFloat(totalSpent.toFixed(2)), // Ensure number format
            spendingByCategory: categorySpending.map(c => ({
                category: c.category,
                amount: parseFloat(c.amount.toFixed(2)),
                percentage: parseFloat(c.percentage.toFixed(1))
            })),
            spendingByVault: vaultSpending.map(v => ({
                vaultName: v.vaultDetails.name,
                amount: parseFloat(v.amount.toFixed(2)),
                percentageOfTotal: parseFloat(v.percentageOfTotal.toFixed(1))
            })),
            spendingTrend: timeSeries.map(t => ({ // Optional: Include trend if needed
                date: t.date,
                amount: parseFloat(t.amount.toFixed(2))
             }))
        };
        return summary;

    } catch (error) {
        console.error(`Error summarizing spending data for user ${userId}:`, error);
        return null;
    }
};

export const generateSpendingInsights = async (userId: string): Promise<string[]> => {
    // Check if OpenAI client is initialized
    if (!client) {
        throw new Error("AI service is not configured (API key missing)"); // 503 Service Unavailable
    }

    // 1. Get summarized data
    const summary = await summarizeSpendingData(userId);

    // 2. Handle insufficient data
    if (!summary) {
        console.log(`Skipping AI insight generation for user ${userId} due to insufficient data.`);
        return ["Not enough spending data yet to generate insights. Keep using VaultPay!"];
    }

    // 3. Construct the prompt
    const prompt = `
        Analyze the following user spending data from the VaultPay app for the period: ${summary.timePeriod}.
        Total spent: INR ${summary.totalSpent.toLocaleString()}.

        Spending by Category (Top 5):
        ${summary.spendingByCategory.map(c => `- ${c.category}: INR ${c.amount.toLocaleString()} (${c.percentage}%)`).join('\n')}

        Spending by Vault (Top 5):
        ${summary.spendingByVault.map(v => `- ${v.vaultName}: INR ${v.amount.toLocaleString()} (${v.percentageOfTotal}% of total)`).join('\n')}

        Based *only* on the data provided, generate 3 to 5 concise (1-2 sentences each), actionable insights or tips for better money management specific to this user. Focus on identifying trends, potential savings, or areas needing attention. Frame the tips positively and encouragingly. Do not invent data. Ensure the output is a simple numbered or bulleted list, with each insight on a new line. Do not include greetings or conversational filler.
    `;

    // 4. Call OpenAI API
    try {
        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful financial assistant for the VaultPay app providing brief, actionable spending insights based on user data." },
                { role: "user", content: prompt },
            ],
            model: "gpt-4.1-mini-2025-04-14", // Or "gpt-4" etc.
            max_tokens: 150, // Limit response length
            n: 1, // Number of choices to generate
            temperature: 0.6, // Adjust creativity (0.0 to 1.0)
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) {
            throw new Error("AI service returned an empty response.");
        }

        // 5. Parse the response (simple splitting by newline and filtering)
        const insights = content
            .split('\n') // Split into lines
            .map(line => line.trim()) // Trim whitespace
            .map(line => line.replace(/^[\d.*-]+\s*/, '')) // Remove leading list markers (numbers, bullets, dashes)
            .filter(line => line.length > 5); // Filter out empty or very short lines

        if (insights.length === 0) {
             throw new Error("AI response could not be parsed into insights.");
        }

        return insights;

    } catch (error: any) {
        console.error("Error calling OpenAI API:", error);
        // Check for specific OpenAI errors if needed (e.g., rate limits, auth errors)
        if (error.response) {
             console.error("OpenAI API Error Details:", error.response.data);
        }
        throw new Error("Could not generate AI insights at this time."); // 503 Service Unavailable
    }
};