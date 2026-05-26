import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .default("postgresql://lostark:lostark@localhost:5432/lostark_roster"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID is required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET is required"),
  AUTH_DISCORD_ID: z.string().min(1, "AUTH_DISCORD_ID is required"),
  AUTH_DISCORD_SECRET: z.string().min(1, "AUTH_DISCORD_SECRET is required"),
  RESET_API_KEY: z.string().min(1, "RESET_API_KEY is required"),
  NEXTAUTH_URL: z.string().default("http://localhost:3000"),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
