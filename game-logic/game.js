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
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameLogic = void 0;
function gameLogic(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const min = 1;
        const max = 100;
        const gameId = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log("game id", gameId);
        const minGame = 1;
        const maxGame = 1000;
        const gameNumber = Math.floor(Math.random() * (maxGame - minGame + 1)) + minGame;
        console.log("game number", gameNumber);
        res.json({ gameId, gameNumber });
    });
}
exports.gameLogic = gameLogic;
exports.default = gameLogic;
