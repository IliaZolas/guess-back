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
// import { MongoClient } from 'mongodb';
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;
mongoose_1.default
    .connect(process.env.DATABASE_ACCESS || '')
    .then(() => {
    console.log('MongoDB connected');
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
// const connectionString = `${process.env.DATABASE_ACCESS}`;
// const mongoClient = new MongoClient(connectionString);
// mongoClient.connect();
// mongoClient.on('open', () => {
//   console.log('Connected to MongoDB');
// });
// mongoClient.on('error', (err) => {
//   console.error('Error connecting to MongoDB:', err);
// });
const corsOptions = {
    origin: ['https://purple-hill-01d316503.3.azurestaticapps.net/', 'http://localhost:3000'],
    credentials: true,
};
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use('/', routes_1.default);
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
