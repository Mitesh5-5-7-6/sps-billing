import mongoose, { Schema } from 'mongoose';
import { IUser } from '@/types/user.type';

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);