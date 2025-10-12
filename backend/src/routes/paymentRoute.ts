import {Router} from 'express';
import * as paymentController from "../controllers/paymentController.js"
import { UserAuth } from '../middleware/auth.js';

const router= Router();

router.use(UserAuth);


router.post("/makePayment",paymentController.makePayment);
router.get("/transactions",paymentController.getTransactions);
router.get("/transactions/:transactionId",paymentController.getTransactionById);
router.get("/summary",paymentController.getUserSpendingSummary);
router.get("/analytics/vaults/:vaultId",paymentController.getVaultAnalytics);
export default router;