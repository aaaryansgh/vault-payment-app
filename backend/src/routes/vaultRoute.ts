import { Router } from "express";
import * as vaultController from "../controllers/vaultController.js"
import { UserAuth } from "../middleware/auth.js";

const router=Router();

// All routes require authentication
router.use(UserAuth);

router.post("/create-vault",vaultController.createVault);
router.get("/user-vaults/:bankAccountId",vaultController.getUserVaults);
router.get("/vault/:id",vaultController.getVaultById);
router.get("/vault/summary/:bankAccountId",vaultController.getVaultSummary);
router.patch("/update/:id",vaultController.updateVault);
router.delete("/delete/:id",vaultController.deleteVault);

export default router;