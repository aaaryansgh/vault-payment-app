import {Router} from 'express';
import { login } from '../controllers/authController.js';
import { register, logout } from '../controllers/authController.js';
import { UserAuth } from '../middleware/auth.js';
import * as authService from '../services/authService.js'

const router=Router();

router.post('/signup',register);
router.post('/login',login);
router.get("/me",UserAuth,async(req,res)=>{
    //@ts-ignore
    const {user}=req;
    const users=await authService.getUserById(user.id);
})
router.post("/logout",UserAuth,logout);

export default router;