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
            if (!passwordCheck) {
                console.log('No password provided');
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user._id,
                userEmail: user.email,
            }, 'RANDOM-TOKEN', { expiresIn: '24h' });
            res.status(200).send({
                message: 'Login Successful',
                email: user.email,
                userId: user._id,
                token,
            });
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
routes.get('/user/show/:id', (req, res) => {
    const userId = req.params.id;
    console.log('GET SINGLE USER RECORD:', userId);
    users_2.default.findOne({ _id: userId }).then((data) => res.json(data));
});
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
// routes.delete('/user/delete/:id', (req: Request, res: Response) => {
//     const userId = req.params.id;
//     console.log(userId, ':delete route');
//     Users.deleteOne({ _id: userId }, function (err: Error | null, _result: any) {
//         if (err) {
//         res.status(400).send(`Error deleting listing with id ${userId}!`);
//         } else {
//         console.log(`${userId} document deleted`);
//         }
//     });
//     cloudinary.v2.config({
//         cloud_name: process.env.CLOUD_NAME,
//         api_key: process.env.CLOUD_API_KEY,
//         api_secret: process.env.CLOUD_API_SECRET,
//     });
//     const publicId = req.params.public_id;
//     console.log('cloudinary check public_id for delete:', publicId);
//     cloudinary.v2.uploader
//         .destroy(publicId)
//         .then((result) => console.log('cloudinary delete', result))
//         .catch((_err) => console.log('Something went wrong, please try again later.'));
//     });
// Game routes
routes.get('/start-the-game', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, game_1.gameLogic)(req, res);
    }
    catch (error) {
        const errorMessage = error.message;
        res.status(500).json({ error: errorMessage });
    }
}));
exports.default = routes;
