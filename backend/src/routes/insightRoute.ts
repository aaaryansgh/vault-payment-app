import { Router } from "express";
import * as insightsController from "../controllers/insightController.js";
import { UserAuth } from "../middleware/auth.js"; // Make sure path is correct

const router = Router();

// All routes in this file require authentication
router.use(UserAuth);

// Define the route for getting insights
router.get("/", insightsController.getInsights);

export default router;