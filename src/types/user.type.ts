import { Document } from 'mongoose';

interface UserBase {
    email: string;
    password: string;
    full_name?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IUser extends UserBase, Document { }
export interface User extends UserBase {
    _id?: string;
}