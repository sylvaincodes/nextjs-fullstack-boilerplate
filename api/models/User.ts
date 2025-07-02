import {
  Schema,
  model,
  models,
  type InferSchemaType,
  type HydratedDocument,
  type Model,
} from "mongoose";

// 1. Define Schema
const UserSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

// 2. Types
export type UserType = InferSchemaType<typeof UserSchema>;
export type UserDocument = HydratedDocument<UserType>;
type UserModel = Model<UserDocument>;

// 3. Safe Export
const User =
  (models.User as UserModel) || model<UserType, UserModel>("User", UserSchema);

export default User;
