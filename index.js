"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes/routes"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
console.log("port:", PORT);
mongoose_1.default
    .connect(process.env.DATABASE_ACCESS || '')
    .then(() => {
    console.log('MongoDB connected');
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
const corsOptions = {
    origin: ['https://purple-hill-01d316503.3.azurestaticapps.net', 'http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'x-csrf-token', 'Accept'],
    exposedHeaders: ['Authorization']
};
const httpsOptions = {
    key: fs_1.default.readFileSync('../localhost.key'),
    cert: fs_1.default.readFileSync('../localhost.crt'),
};
const httpsServer = https_1.default.createServer(httpsOptions, app);
httpsServer.listen(PORT, () => {
    console.log(`Server is running on HTTPS at https://localhost:${PORT}`);
});
app.use((0, cors_1.default)(corsOptions));
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use('/', routes_1.default);
