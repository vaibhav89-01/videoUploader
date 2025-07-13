import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI!;
if(!MONGODB_URI){
    throw new Error("Please define mongodb uri in env variabbles");
}

let cached = global.mongoose;
if(!cached){
    cached = {conn : null, promise : null};
}
export async function connectToDatabase() {
    if(cached.conn){
        return cached.conn;
    }

    if(!cached.promise){
        mongoose
        .connect(MONGODB_URI)
        .then(()=> mongoose.connection)
    }
    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null;
        throw error;
    }
    return cached.conn;
}