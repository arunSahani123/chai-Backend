import mongoose from 'mongoose';
import dotenv from "dotenv";
import connectionDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env'
});

connectionDB()
.then(() => {
        app.listen(process.env.PORT || 5000,()=>{
        console.log(`Server is running on port ${process.env.PORT || 5000}`);
    });
   
})
.catch((error) => {
    console.error("Failed to connect to the database:", error);
});




