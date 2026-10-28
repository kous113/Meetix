import express from "express";
import {register,logIn,validate,addToHistory,getUserHistory} from "../controllers/user.controller.js"
const router=express.Router();



router.route("/login").post(logIn);
router.route("/register").post(register);
router.route("/validate-user").get(validate);
router.route("/add_to_activity").post(addToHistory);
router.route("/get-all-activity").get(getUserHistory);

export default router;