import bcrypt from "bcryptjs";
import mongoose, { Schema, models, Document } from "mongoose";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    password?: string;
    age?: number;
    gender?: "male" | "female";
    profileCompleted: boolean;
}

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    age: {type: Number, min: 18},
    gender: {type: String, enum: ["male", "female"]},
    profileCompleted: {type: Boolean, default: false}
  },
  { timestamps: true }
);

UserSchema.pre("save", async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
})

const User = models.User || mongoose.model("User", UserSchema);

export default User;
