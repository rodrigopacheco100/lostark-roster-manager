import { relations } from "drizzle-orm"
import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core"

/* ───────── ENUMS ───────── */
export enum FriendRequestStatus {
  Pending = "pending",
  Accepted = "accepted",
  Declined = "declined",
}

export enum GroupRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
}

export enum LostArkClass {
  // Warriors
  Berserker = "Berserker",
  Destroyer = "Destroyer",
  Gunlancer = "Gunlancer",
  Paladin = "Paladin",
  Slayer = "Slayer",
  Valkyrie = "Valkyrie",

  // Mages
  Arcanist = "Arcanist",
  Summoner = "Summoner",
  Bard = "Bard",
  Sorceress = "Sorceress",

  // Martial Artists
  Wardancer = "Wardancer",
  Scrapper = "Scrapper",
  Soulfist = "Soulfist",
  Glaivier = "Glaivier",
  Striker = "Striker",
  Breaker = "Breaker",

  // Assassins
  Deathblade = "Deathblade",
  Shadowhunter = "Shadowhunter",
  Reaper = "Reaper",
  Souleater = "Souleater",

  // Gunner
  Sharpshooter = "Sharpshooter",
  Deadeye = "Deadeye",
  Artillerist = "Artillerist",
  Machinist = "Machinist",
  Gunslinger = "Gunslinger",

  // Specialist
  Artist = "Artist",
  Aeromancer = "Aeromancer",
  Wildsoul = "Wildsoul",

  // Guardian knight
  GuardianKnight = "GuardianKnight",
}

/* ───────── USERS ───────── */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  googleId: text("google_id").unique(),
  discordId: text("discord_id").unique(),
  friendCode: text("friend_code").notNull().unique(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ───────── ROSTERS ───────── */
export const rosters = pgTable("rosters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rosterGuid: text("roster_guid"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ───────── CHARACTERS ───────── */
export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  class: text("class").$type<LostArkClass>().notNull(),
  itemLevel: integer("item_level").notNull(),
  characterGuid: text("character_guid"),
  rosterId: uuid("roster_id")
    .notNull()
    .references(() => rosters.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ───────── FRIEND REQUESTS ───────── */
export const friendRequests = pgTable("friend_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").$type<FriendRequestStatus>().notNull().default(FriendRequestStatus.Pending),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ───────── FRIENDSHIPS ───────── */
export const friendships = pgTable("friendships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  friendId: uuid("friend_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ───────── GROUPS ───────── */
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

/* ───────── GROUP MEMBERS ───────── */
export const groupMembers = pgTable(
  "group_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").$type<GroupRole>().notNull().default(GroupRole.Member),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueGroupMember: uniqueIndex("group_member_idx").on(table.groupId, table.userId),
  }),
)

/* ───────── GROUP BANS ───────── */
export const groupBans = pgTable(
  "group_bans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueGroupBan: uniqueIndex("group_ban_idx").on(table.groupId, table.userId),
  }),
)

/* ───────── RAIDS (global) ───────── */
export const raids = pgTable(
  "raids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("raid_slug_idx").on(table.slug),
    nameIdx: index("raid_name_idx").on(table.name),
  }),
)

/* ───────── RAID DIFFICULTIES ───────── */
export const raidDifficulties = pgTable(
  "raid_difficulties",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    raidId: uuid("raid_id")
      .notNull()
      .references(() => raids.id, { onDelete: "cascade" }),
    difficulty: text("difficulty").notNull(),
    minIlvl: integer("min_ilvl").notNull(),
  },
  (table) => ({
    uniqueRaidDifficulty: uniqueIndex("raid_diff_idx").on(table.raidId, table.difficulty),
  }),
)

/* ───────── CHARACTER RAIDS (junction) ───────── */
export const characterRaids = pgTable(
  "character_raids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    characterId: uuid("character_id")
      .notNull()
      .references(() => characters.id, { onDelete: "cascade" }),
    raidDifficultyId: uuid("raid_difficulty_id")
      .notNull()
      .references(() => raidDifficulties.id, { onDelete: "cascade" }),
    completed: boolean("completed").notNull().default(false),
  },
  (table) => ({
    uniqueCharRaidDiff: uniqueIndex("char_raid_diff_idx").on(table.characterId, table.raidDifficultyId),
  }),
)

/* ───────── RELATIONS ───────── */
export const usersRelations = relations(users, ({ many }) => ({
  rosters: many(rosters),
  sentRequests: many(friendRequests, { relationName: "sender" }),
  receivedRequests: many(friendRequests, { relationName: "receiver" }),
  friendships: many(friendships, { relationName: "user" }),
  friendOf: many(friendships, { relationName: "friend" }),
  groupMemberships: many(groupMembers),
  groupBans: many(groupBans),
}))

export const rostersRelations = relations(rosters, ({ one, many }) => ({
  user: one(users, { fields: [rosters.userId], references: [users.id] }),
  characters: many(characters),
}))

export const charactersRelations = relations(characters, ({ one, many }) => ({
  roster: one(rosters, { fields: [characters.rosterId], references: [rosters.id] }),
  characterRaids: many(characterRaids),
}))

export const friendRequestsRelations = relations(friendRequests, ({ one }) => ({
  sender: one(users, { fields: [friendRequests.senderId], references: [users.id], relationName: "sender" }),
  receiver: one(users, { fields: [friendRequests.receiverId], references: [users.id], relationName: "receiver" }),
}))

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, { fields: [friendships.userId], references: [users.id], relationName: "user" }),
  friend: one(users, { fields: [friendships.friendId], references: [users.id], relationName: "friend" }),
}))

export const groupsRelations = relations(groups, ({ many }) => ({
  members: many(groupMembers),
  bans: many(groupBans),
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}))

export const groupBansRelations = relations(groupBans, ({ one }) => ({
  group: one(groups, { fields: [groupBans.groupId], references: [groups.id] }),
  user: one(users, { fields: [groupBans.userId], references: [users.id] }),
}))

export const raidsRelations = relations(raids, ({ many }) => ({
  difficulties: many(raidDifficulties),
}))

export const raidDifficultiesRelations = relations(raidDifficulties, ({ one, many }) => ({
  raid: one(raids, { fields: [raidDifficulties.raidId], references: [raids.id] }),
  characterRaids: many(characterRaids),
}))

export const characterRaidsRelations = relations(characterRaids, ({ one }) => ({
  character: one(characters, { fields: [characterRaids.characterId], references: [characters.id] }),
  raidDifficulty: one(raidDifficulties, {
    fields: [characterRaids.raidDifficultyId],
    references: [raidDifficulties.id],
  }),
}))
