import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Users table (ready for Better Auth integration)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Bookmarks table to store user saved workouts/recipes
export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  itemId: text('item_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Completed sessions table for the "Energy Bank"
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  itemId: text('item_id').notNull(),
  completedAt: timestamp('created_at').defaultNow().notNull(),
});
