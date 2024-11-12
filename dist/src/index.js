"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const dbConnection_1 = require("./config/dbConnection");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const retreatRoutes_1 = __importDefault(require("./routes/retreatRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const reviewRoutes_1 = __importDefault(require("./routes/reviewRoutes"));
const wishlistRoutes_1 = __importDefault(require("./routes/wishlistRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(errorHandler_1.errorHandler);
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/category", categoryRoutes_1.default);
app.use("/api/retreats", retreatRoutes_1.default);
app.use("/api/wishlists", wishlistRoutes_1.default);
app.use("/api/notification", notificationRoutes_1.default);
app.use("/api/review", reviewRoutes_1.default);
app.use("/api/booking", bookingRoutes_1.default);
app.use("/api/subscribtion", subscriptionRoutes_1.default);
app.use("/api/upload", uploadRoutes_1.default);
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, dbConnection_1.connectDb)();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.log("Failed to start server:", error);
    }
});
startServer();
