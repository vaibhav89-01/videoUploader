import mongoose, {Schema,models,model} from "mongoose";
import bcrypt from "bcryptjs";

// Define the User schema
export interface IUser{
    email : string,
    password : string,
    _id? : mongoose.Types.ObjectId,
    createdAt?: Date,
    updatedAt?: Date
}

const userSchema = new Schema<IUser>({
    email : {type : String, required : true, unique: true},
    password : {type : String, required : true, unique : true},

},{timestamps : true})

// pre-hook to hash the passowrd before saving
userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,10)
    }
    next();
})

const User = models?.User || model<IUser>('User',userSchema);
export default User;