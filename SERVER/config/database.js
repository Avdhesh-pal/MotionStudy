import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGODB_URL } = process.env;

export const databaseConnect = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("DB Connection Success");
    } catch (err) {
        console.log("DB Connection Failed");
        console.error(err);
        process.exit(1);
    }
};
