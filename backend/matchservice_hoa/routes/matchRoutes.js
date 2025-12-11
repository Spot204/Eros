import express from "express";
import {
getNextRecommendations,
sendSwipe,
getMatches,
} from "../controllers/recommendationController.js";


const router = express.Router();


router.get("/next", getNextRecommendations);
router.post("/swipe", sendSwipe);
router.get("/", getMatches);


export default router;
