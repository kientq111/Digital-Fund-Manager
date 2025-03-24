import type { NextAuthOptions, Session, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { db } from "@/lib/db"
import { compare } from "bcrypt"
import { JWT } from "next-auth/jwt"
import { getServerSession } from "next-auth"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/login",
        error: "/auth/error",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "name@example.com"
                },
                password: {
                    label: "Password",
                    type: "password",
                    placeholder: "••••••••"
                },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Missing credentials")
                    }

                    const user = await db.user.findUnique({
                        where: { email: credentials.email.toLowerCase() },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            password: true,
                            role: true,
                        }
                    })

                    if (!user) {
                        throw new Error("Invalid credentials")
                    }

                    const isPasswordValid = await compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials")
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    }
                } catch (error) {
                    console.error("Authentication error:", error)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async session({ token, session }: { token: JWT, session: Session }) {
            if (token) {
                session.user.id = token.id as string
                session.user.name = token.name as string
                session.user.email = token.email as string
                session.user.role = token.role as string
            }
            return session
        },
        async jwt({ token, user }: { token: JWT, user: User | null }) {
            if (user) {
                token.id = user.id
                token.role = user.role
            }
            return token
        },
    },
}

export async function getAuthSession() {
    const session = await getServerSession(authOptions)
    return session
}