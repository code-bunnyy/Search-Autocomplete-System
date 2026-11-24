import { Router } from "express";
import { getQueryPrefix } from "../controllers/getQueryPrefix.js";

const router = Router();

router.get("/", getQueryPrefix);

export default router;