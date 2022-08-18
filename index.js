import express, { json } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import connectDB from './config/connectdb.js';
import userRouter from './routes/userRouter.js';

const app = express();
const port = process.env.PORT;
const database_url = process.env.DATABASE_URL;

// cors policy 
app.use(cors());

// db connection
connectDB(database_url);

// body-parser
app.use(express.urlencoded({extended: false}));

// json parser
app.use(express.json());

// routes
app.use('/api', userRouter)


app.listen(port, () => {
    console.log('app ruing..')
})