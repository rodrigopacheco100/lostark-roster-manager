import { eq } from "drizzle-orm"
import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"
import Google from "next-auth/providers/google"
import { db } from "@/db"
import { users } from "@/db/schema"

const providerField = {
  google: "googleId" as const,
  discord: "discordId" as const,
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    Discord({
      profile(profile) {
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username,
          email: profile.email,
          image: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async signIn({ user, profile: _profile, account }) {
      if (!user.email || !account?.provider) return false

      const field = providerField[account.provider as keyof typeof providerField]
      if (!field) return false

      const providerId = String(account.providerAccountId)

      const byEmail = await db.query.users.findFirst({
        where: eq(users.email, user.email),
      })
      if (byEmail) {
        await db
          .update(users)
          .set({ [field]: providerId })
          .where(eq(users.id, byEmail.id))
        return true
      }

      await db.insert(users).values({
        name: user.name ?? "",
        email: user.email,
        friendCode: `FC${Date.now()}`,
        [field]: providerId,
        image: user.image,
      })
      return true
    },
    async jwt({ token, account, profile: _profile }) {
      if (account?.provider) {
        const field = providerField[account.provider as keyof typeof providerField]
        if (field) {
          const existing = await db.query.users.findFirst({
            where: eq(users[field], account.providerAccountId),
          })
          if (existing) {
            token.sub = existing.id
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
