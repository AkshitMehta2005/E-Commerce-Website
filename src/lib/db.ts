import mongoose from "mongoose";
import dns from "node:dns";

let cached = (global as any).mongoose

if(!cached){
    cached = (global as any).mongoose = {conn:null,promise:null}
}

const connectDb = async ()=>{
    const mongoDbUrl = process.env.MONGODB_URL
    if(!mongoDbUrl){
        throw new Error("DB Error")
    }

    if(cached.conn){
        return cached.conn
dns.setServers(["8.8.8.8", "1.1.1.1"]);

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    };
}

const connectDb = async () => {
    // Get env variable at runtime
    const mongoDbUrl = process.env.MONGODB_URL;

    if (!mongoDbUrl) {
        throw new Error("MONGODB_URL is missing");
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(mongoDbUrl)
            .then((mongooseInstance) => mongooseInstance.connection);
    }

    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (error) {
        cached.promise = null
        throw error
        const conn = await cached.promise;
        cached.conn = conn;
        return conn;
    } catch (error) {
        cached.promise = null;
        console.error("MongoDB connection error:", error);
        throw error;
    }
};

export default connectDb;