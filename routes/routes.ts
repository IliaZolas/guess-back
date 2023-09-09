import express, { Request, Response } from 'express';
import { Router } from 'express';
import newUserTemplateCopy from '../models/users';
import Users from '../models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authMiddleware from './auth';
import {gameLogic} from '../game-logic/game'

const routes: Router = express.Router();

// Index Routes
routes.get('/', (req: Request, res: Response) => {
        res.send('Hello world');
    });

// Route to check authentication status 
routes.get('/check-auth', (req: Request, res: Response) => {
    const accessToken = req.cookies.accessToken;
    
        if (!accessToken) {
            return res.status(401).json({ authenticated: false });
            }
            
            jwt.verify(accessToken, 'accessTokenSecret', (err: any, decoded: any) => {
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
routes.post('/signup', (req: Request, res: Response) => {
bcrypt
.hash(req.body.password, 10)
.then((hashedPassword) => {
    const user = new newUserTemplateCopy({
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

routes.post('/login', (req: Request, res: Response) => {
    console.log('login route triggered');

    Users.findOne({ email: req.body.email })
        .then((user) => {
        console.log('user object:', user);

        if (!user) {
            res.status(404).send({
            message: 'Email not found',
            });
            return;
        }

        bcrypt
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
            } else {

                const refreshToken = jwt.sign(
                    {
                        userId: user._id,
                        userEmail: user.email,
                    },
                    'refreshTokenSecret',
                    { expiresIn: '7d' } 
                );

                const accessToken = jwt.sign(
                    {
                        userId: user._id,
                        userEmail: user.email,
                        refreshToken: refreshToken,
                    },
                    'accessTokenSecret',
                    { expiresIn: '24h' }
                );
                console.log("login route: token ->",accessToken)
                console.log("Login route: refreshToken ->",refreshToken)
                
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

routes.get('/user/show/:id', authMiddleware, (req: Request, res: Response) => {
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

        Users.findOne({ _id: userId }).then((data) => res.json(data));
        });
    // });

routes.put('/user/update/:id', authMiddleware, (req: Request, res: Response) => {
    const userId = req.params.id;
    console.log('update user id route', userId);

    Users.updateOne(
    { _id: userId },
    {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        imageUrl: req.body.imageUrl,
        public_id: req.body.publicId,
    }
    ).then((data) => res.json(data));
    });

routes.post('/logout', (req, res) => {
    console.log("tried to logout")
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'none', secure: true, path: '/' });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'none', secure: true, path: '/' });
    res.status(200).json({ message: 'Logout successful' });
});

// Game routes 

routes.get('/start-the-game', authMiddleware, async (req: Request, res: Response) => {
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
            await gameLogic(req, res);
        } catch (error) {
            const errorMessage = (error as Error).message;
            res.status(500).json({ error: errorMessage });
        }
});

routes.post('/check-guess', (req: Request, res: Response) => {
    const userGuess = req.body.guess;
    const gameNumber = req.body.gameNumber
    console.log("this is the guessed number", userGuess )
    console.log("this is the game number", gameNumber )

    if (userGuess === gameNumber) {
        res.json({ result: 'success' });
    } else if (userGuess < gameNumber) {
        res.json({ result: 'low' });
    } else {
        res.json({ result: 'high' });
    }
});

export default routes;
