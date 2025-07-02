import User, { UserDocument } from "@/models/User";
import { BaseRepository } from "./BaseRepository";

export class UserRepositoryClass extends BaseRepository<UserDocument> {
  constructor() {
    super(User);
  }
  async findByClerkId(clerkId: string): Promise<UserDocument | null> {
    return this.findOne({ clerkId });
  }
  async updateByClerkId(
    clerkId: string,
    data: Partial<UserDocument>
  ): Promise<UserDocument | null> {
    return User.findOneAndUpdate({ clerkId }, data, { new: true });
  }
}

export const UserRepository = new UserRepositoryClass();
