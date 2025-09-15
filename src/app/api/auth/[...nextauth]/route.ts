// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/mongodb';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                await dbConnect();
                const user = await User.findOne({ email: credentials.email });
                if (!user) return null;
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                if (!isPasswordValid) return null;
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.full_name,
                    role: user.role
                };
            }
        })
    ],
    session: { strategy: 'jwt' },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.sub ?? '';
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
    }
});

export { handler as GET, handler as POST };
