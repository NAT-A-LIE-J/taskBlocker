import { z } from "zod";

// Block Types
export const blockTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  createdAt: z.date(),
});

export const insertBlockTypeSchema = blockTypeSchema.omit({
  id: true,
  createdAt: true,
});

export type BlockType = z.infer<typeof blockTypeSchema>;
export type InsertBlockType = z.infer<typeof insertBlockTypeSchema>;

// Time Blocks
export const timeBlockSchema = z.object({
  id: z.string(),
  blockTypeId: z.string(),
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday
  startTime: z.string(), // "14:30"
  endTime: z.string(),   // "16:00"
  createdAt: z.date(),
});

export const insertTimeBlockSchema = timeBlockSchema.omit({
  id: true,
  createdAt: true,
});

export type TimeBlock = z.infer<typeof timeBlockSchema>;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;

// Subtasks
export const subtaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
});

export const insertSubtaskSchema = subtaskSchema.omit({
  id: true,
  createdAt: true,
});

export type Subtask = z.infer<typeof subtaskSchema>;
export type InsertSubtask = z.infer<typeof insertSubtaskSchema>;

// Tasks
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  deadline: z.date().optional(),
  priority: z.boolean().default(false),
  blockTypeId: z.string().optional(),
  completed: z.boolean().default(false),
  archived: z.boolean().default(false),
  subtasks: z.array(subtaskSchema).default([]),
  createdAt: z.date(),
  completedAt: z.date().optional(),
  archivedAt: z.date().optional(),
});

export const insertTaskSchema = taskSchema.omit({
  id: true,
  createdAt: true,
});

export type Task = z.infer<typeof taskSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Timer Sessions
export const timerSessionSchema = z.object({
  id: z.string(),
  blockTypeId: z.string(),
  startTime: z.date(),
  pausedTime: z.number().default(0), // milliseconds paused
  completed: z.boolean().default(false),
  endedEarly: z.boolean().default(false),
});

export const insertTimerSessionSchema = timerSessionSchema.omit({
  id: true,
});

export type TimerSession = z.infer<typeof timerSessionSchema>;
export type InsertTimerSession = z.infer<typeof insertTimerSessionSchema>;

// App Data Structure
export const appDataSchema = z.object({
  blockTypes: z.array(blockTypeSchema),
  timeBlocks: z.array(timeBlockSchema),
  tasks: z.array(taskSchema),
  timerSessions: z.array(timerSessionSchema),
  settings: z.object({
    darkMode: z.boolean().default(false),
    weekStartDay: z.number().default(0), // 0 = Sunday
    audioNotifications: z.boolean().default(true),
    timeRange: z.object({
      start: z.string().default("07:00"),
      end: z.string().default("23:00"),
    }),
  }),
});

export type AppData = z.infer<typeof appDataSchema>;
