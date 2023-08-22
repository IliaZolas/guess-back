"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = __importDefault(require("cloudinary"));
const cloudinaryConfig = cloudinary_1.default.v2;
cloudinaryConfig.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.AWS_ACCESS_KEY_ID,
    api_secret: process.env.AWS_SECRET_ACCESS_KEY,
});
exports.default = cloudinaryConfig;
