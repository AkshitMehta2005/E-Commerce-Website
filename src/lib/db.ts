import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    const mongoDbUrl = process.env.MONGODB_URL;
    if (!mongoDbUrl) {
        throw new Error("DB Error: MONGODB_URL environment variable is not set");
    }

    if (cached.conn) {
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoDbUrl).then((conn) => conn.connection);
    }
    try {
        const conn = await cached.promise;
        return conn;
    } catch (error) {
        cached.promise = null;
        console.log(error);
        throw error;
    }
};

export default connectDb;