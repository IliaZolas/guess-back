import express, { Express } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import routesUrls from './routes/routes';
import cors, { CorsOptions } from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app: Express = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 4000;
console.log("port:",PORT)

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

mongoose
  .connect(process.env.DATABASE_ACCESS || '')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const corsOptions: CorsOptions = {
  origin: ['https://purple-hill-01d316503.3.azurestaticapps.net/', 'http://localhost:3000'],
  credentials: true,
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors(corsOptions));
app.use('/', routesUrls);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
