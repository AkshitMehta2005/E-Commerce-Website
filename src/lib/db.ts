import mongoose from "mongoose";

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
    }
    if(!cached.promise){
        cached.promise = mongoose.connect(mongoDbUrl).then((conn)=>conn.connection)
    }
    try {
        cached.conn = await cached.promise
        return cached.conn
    } catch (error) {
        cached.promise = null
        throw error
    }
}

export default connectDb