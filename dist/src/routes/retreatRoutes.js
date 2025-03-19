"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const retreatControllers_1 = require("../controllers/retreatControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/add-retreat", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRole)(["admin", "organiser"]), (0, asyncHandler_1.default)(retreatControllers_1.createRetreat));
router.put("/update-retreat/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRole)(["admin", "organiser"]), (0, asyncHandler_1.default)(retreatControllers_1.updateRetreat));
router.delete("/delete-retreat/:id", authMiddleware_1.verifyToken, (0, authMiddleware_1.authorizeRole)(["admin"]), (0, asyncHandler_1.default)(retreatControllers_1.deleteRetreat));
router.get("/get-all-retreats", (0, asyncHandler_1.default)(retreatControllers_1.getAllRetreats));
router.get("/get-retreats/:id", (0, asyncHandler_1.default)(retreatControllers_1.getRetreatById));
router.get("/organiser/retreats/:organizerId", (0, asyncHandler_1.default)(retreatControllers_1.getRetreatsByOrganizer));
router.get("/get-retreat-admin", 
// verifyToken,
// authorizeRole(["admin"]), // Only admin can approve retreats,
(0, asyncHandler_1.default)(retreatControllers_1.getCreatedRetreatsByAdmin));
router.put("/approve-retreat/:id", 
// verifyToken,
// authorizeRole(["admin"]),
(0, asyncHandler_1.default)(retreatControllers_1.approveRetreat));
router.get("/admin/retreats", (0, asyncHandler_1.default)(retreatControllers_1.getRetreats));
exports.default = router;
