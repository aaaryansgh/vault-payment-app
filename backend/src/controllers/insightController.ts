import type { Request, Response } from "express";
import * as insightsService from "../services/insightService.js";

/**
 * GET /api/insights
 * Fetches AI-generated spending insights for the authenticated user.
 */
export const getInsights = async (req: Request, res: Response) => {
    //@ts-ignore - Assuming UserAuth middleware adds user to req
    const { user } = req;

    if (!user || !user.id) {
        // This should ideally be caught by UserAuth middleware, but added as a safeguard
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const insights = await insightsService.generateSpendingInsights(user.id);

        res.status(200).json({
            success: true,
            data: {
                insights, // Returns an array of strings
            },
        });
    } catch (error: any) {
        console.error(`Error fetching insights for user ${user.id}:`, error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate insights',
        });
    }
};