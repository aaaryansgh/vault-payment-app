import { Router } from "express";
import * as bankAccountController from "../controllers/bankAccountController.js"
import { UserAuth } from "../middleware/auth.js";

const router=Router();

router.use(UserAuth);

router.post("/link-account",bankAccountController.linkBankAccount);
router.get("/user-accounts",bankAccountController.getUserBankAccounts);
router.get("/primary",bankAccountController.getPrimaryAccount);
router.get("/:id",bankAccountController.getBankAccountById);
router.get("/:id/summary",bankAccountController.getAccountSummary);
router.patch("/:id/set-primary",bankAccountController.setPrismaryAccount);
router.patch("/:id/balance",bankAccountController.updateBalance);
router.patch("/:id",bankAccountController.updateBankAccount);
router.delete("/:id",bankAccountController.unlinkBankAccount);

export default router;