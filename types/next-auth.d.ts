import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string
            name: string
            email: string
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
    }
}