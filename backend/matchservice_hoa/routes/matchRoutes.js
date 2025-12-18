import express from "express";
import {
getNextRecommendations,
sendSwipe,
getMatches,
getLikedMe,
getAllInterests
} from "../controllers/recommendationController.js";


const router = express.Router();


router.get("/next", getNextRecommendations);
router.post("/swipe", sendSwipe);
router.get("/liked-me", getLikedMe);
router.get("/interests", getAllInterests);
router.get("/", getMatches);


export default router;