import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
import dotenv from "dotenv";
import connectionDB from './db/index.js';

dotenv.config({
    path: './.env'
});

connectionDB();




// (async () => {
//     try {   
//         await mongoose.connect( `${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log('Connected to MongoDB successfully!');
//     } catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//     }
// })();