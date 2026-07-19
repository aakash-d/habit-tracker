export type Frequency = 
    | { type: "daily" }
    | { type: "weekdays" }
    | { type: "specificDays"; days: number[] } // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    | { type: "timesPerWeek"; count: number }; // e.g., 3 times per week

export interface Category {
    id: string;
    name: string;
    color: string; // Hex color code
}

export interface Habit {
    id: string;
    name: string;
    icon?: string;
    categoryId?: string;
    frequency: Frequency;
    order: number;
    createdAt: string; // ISO date string
    archived?: boolean;
}

export interface OneOffTask {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    categoryId?: string;
    note?: string;
    done?: boolean;
}

export interface DayRecord {
    completions: Record<string, boolean>; // habitId -> done
    taskNotes?: Record<string, string>; // habitId -> note
    dayNote?: string;
}

export type RecordsByDate = Record<string, DayRecord>;

export type WeekStart = 0 | 1; // 0=Sunday, 1=Monday

export interface Settings {
    weekStart: WeekStart;
    darkMode: boolean;
}