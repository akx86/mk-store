import mongoose, { Document, Schema } from "mongoose";
export type UserRole = "PENDING_MERCHANT" | "MERCHANT" | "ADMIN" | "USER";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  storeName?: string;
  storeAddress?: string;
  storeImage?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["PENDING_MERCHANT", "MERCHANT", "ADMIN", "USER"],
      default: "USER",
    },
    storeName: { type: String },
    storeAddress: { type: String },
    storeImage: { type: String },
    phoneNumber: { type: String },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
