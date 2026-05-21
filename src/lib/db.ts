import mongoose from "mongoose";
import dns from "node:dns";

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