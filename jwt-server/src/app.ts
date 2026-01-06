import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import authRouter from './routes/auth';

dotenv.config();
const { MONGO_URL } = process.env;

const app = express();

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5174',
  }),
);

app.use(express.json());

app.use(authRouter);

const run = async () => {
  try {
    await mongoose.connect(MONGO_URL as string);

    console.log('MongoDB connected');

    app.listen(3005, () => {
      console.log('Started on', 3005);
    });
  } catch (error) {
    console.error(error);
  }
};

run();
