// app/api/setup-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/user.model";
import { checkAuth } from "@/lib/checkAuth";
import { z } from "zod";

const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(1).default("admin"),
    role: z.enum(["user", "admin"]).default("admin"),
});

export async function POST(req: NextRequest) {
    const session = await checkAuth();
    if (session instanceof Response) return session;

    // Ensure current user is an admin
    // if (session.user.role !== 'admin') {
    //     return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    // }

    try {
        const body = await req.json();
        const parsed = CreateUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: "Invalid input", errors: parsed.error.message },
                { status: 400 }
            );
        }

        const { email, password, full_name, role } = parsed.data;

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            email,
            password: hashedPassword,
            full_name,
            role,
        });

        await newUser.save();

        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { message: "Server error", error },
            { status: 500 }
        );
    }
}
