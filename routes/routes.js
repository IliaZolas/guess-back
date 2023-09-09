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
const users_1 = __importDefault(require("../models/users"));
const users_2 = __importDefault(require("../models/users"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("./auth"));
const game_1 = require("../game-logic/game");
const routes = express_1.default.Router();
// Index Routes
routes.get('/', (req, res) => {
    res.send('Hello world');
});
// Route to check authentication status 
routes.get('/check-auth', (req, res) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        return res.status(401).json({ authenticated: false });
    }
    jsonwebtoken_1.default.verify(accessToken, 'accessTokenSecret', (err, decoded) => {
        if (err) {
            return res.status(403).json({ authenticated: false });
        }
        const userId = decoded.userId;
        const userEmail = decoded.userEmail;
        res.status(200).json({
            authenticated: true,
            userId: userId,
            userEmail: userEmail,
        });
    });
});
// User Routes
routes.post('/signup', (req, res) => {
    bcrypt_1.default
        .hash(req.body.password, 10)
        .then((hashedPassword) => {
        const user = new users_1.default({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashedPassword,
            imageUrl: req.body.imageUrl,
            public_id: req.body.publicId,
        });
        user
            .save()
            .then((result) => {
            res.status(201).send({
                message: 'User Created Successfully',
                result,
            });
        })
            .catch((error) => {
            console.log(error),
                res.status(500).send({
                    message: 'Error creating user',
                    error,
                });
        });
    })
        .catch((e) => {
        res.status(500).send({
            message: 'Password was not hashed successfully',
            e,
        });
    });
});
routes.post('/login', (req, res) => {
    console.log('login route triggered');
    users_2.default.findOne({ email: req.body.email })
        .then((user) => {
        console.log('user object:', user);
        if (!user) {
            res.status(404).send({
                message: 'Email not found',
            });
            return;
        }
        bcrypt_1.default
            .compare(req.body.password, user.password)
            .then((passwordCheck) => {
            console.log('password check object:', passwordCheck);
            if (passwordCheck === false) {
                console.log('No password provided or wrong password');
                res.status(200).send({
                    message: 'Login Failed',
                    email: user.email,
                    userId: user._id,
                    passwordCheck
                });
            }
            else {
                const refreshToken = jsonwebtoken_1.default.sign({
                    userId: user._id,
                    userEmail: user.email,
                }, 'refreshTokenSecret', { expiresIn: '7d' });
                const accessToken = jsonwebtoken_1.default.sign({
                    userId: user._id,
                    userEmail: user.email,
                    refreshToken: refreshToken,
                }, 'accessTokenSecret', { expiresIn: '24h' });
                console.log("login route: token ->", accessToken);
                console.log("Login route: refreshToken ->", refreshToken);
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 300000,
                });
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 300000,
                });
                res.status(200).send({
                    message: 'Login Successful',
                    email: user.email,
                    userId: user._id,
                    accessToken,
                    refreshToken
                });
            }
        })
            .catch((error) => {
            res.status(400).send({
                message: 'Passwords do not match',
                error,
            });
        });
    })
        .catch((e) => {
        res.status(500).send({
            message: 'An error occurred',
            error: e,
        });
    });
});
routes.get('/user/show/:id', auth_1.default, (req, res) => {
    // const accessToken = req.cookies.accessToken;
    // if (!accessToken) {
    //     return res.status(401).json({ authenticated: false });
    // }
    // jwt.verify(accessToken, 'accessTokenSecret', async (err: any, decoded: any) => {
    //     if (err) {
    //         return res.status(403).json({ authenticated: false });
    //     }
    const userId = req.params.id;
    console.log('User show has been triggered:', userId);
    users_2.default.findOne({ _id: userId }).then((data) => res.json(data));
});
// });
routes.put('/user/update/:id', auth_1.default, (req, res) => {
    const userId = req.params.id;
    console.log('update user id route', userId);
    users_2.default.updateOne({ _id: userId }, {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        imageUrl: req.body.imageUrl,
        public_id: req.body.publicId,
    }).then((data) => res.json(data));
});
routes.post('/logout', (req, res) => {
    console.log("tried to logout");
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true, path: '/' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true, path: '/' });
    res.status(200).json({ message: 'Logout successful' });
});
// Game routes 
routes.get('/start-the-game', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const accessToken = req.cookies.accessToken;
    // // console.log("start the game access token? -->",accessToken)
    // if (!accessToken) {
    //     return res.status(401).json({ authenticated: false });
    // }
    // jwt.verify(accessToken, 'accessTokenSecret', async (err: any, decoded: any) => {
    //     if (err) {
    //         return res.status(403).json({ authenticated: false });
    //     }
    try {
        yield (0, game_1.gameLogic)(req, res);
    }
    catch (error) {
        const errorMessage = error.message;
        res.status(500).json({ error: errorMessage });
    }
}));
routes.post('/check-guess', (req, res) => {
    const userGuess = req.body.guess;
    const gameNumber = req.body.gameNumber;
    console.log("this is the guessed number", userGuess);
    console.log("this is the game number", gameNumber);
    if (userGuess === gameNumber) {
        res.json({ result: 'success' });
    }
    else if (userGuess < gameNumber) {
        res.json({ result: 'low' });
    }
    else {
        res.json({ result: 'high' });
    }
});
exports.default = routes;
