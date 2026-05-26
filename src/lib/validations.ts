import { z } from "zod"
import { LostArkClass } from "@/db/schema"

export const createRosterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export const updateRosterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export const createCharacterSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  class: z.nativeEnum(LostArkClass, { message: "Invalid class" }),
  itemLevel: z.number().int().min(1, "Item level is required"),
})

export const updateCharacterSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  class: z.nativeEnum(LostArkClass, { message: "Invalid class" }),
  itemLevel: z.number().int().min(1, "Item level is required"),
})

export const createFriendRequestSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().optional(),
  })
  .refine((data) => data.email || data.name, {
    message: "Provide email or name to search",
  })

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export const updateGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
})

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
})

export const transferOwnershipSchema = z.object({
  targetUserId: z.string().uuid("Invalid user ID"),
})

export const changeRoleSchema = z.object({
  role: z.enum(["admin", "member"], { message: "Role must be admin or member" }),
})

export const targetUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
})
