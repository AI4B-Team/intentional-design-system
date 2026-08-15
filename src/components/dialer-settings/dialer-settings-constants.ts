export const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "America/Phoenix", label: "Arizona" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
];

export const DISPOSITION_CATEGORIES = [
  { value: "positive", label: "Positive", description: "Counts as success" },
  { value: "negative", label: "Negative", description: "Reached but not interested" },
  { value: "neutral", label: "Neutral", description: "Reached, pending" },
  { value: "no_contact", label: "No Contact", description: "Didn't speak to anyone" },
  { value: "bad_number", label: "Bad Number", description: "Number issues" },
];

export const EMOJI_OPTIONS = ["📅", "🔄", "📞", "❌", "🔴", "👎", "🚫", "⛔", "📵", "💬", "✅", "⏰", "📝", "🎯"];

export interface Disposition {
  id: string;
  name: string;
  category: string;
  icon: string | null;
  color: string | null;
  keyboard_shortcut: string | null;
  removes_from_queue: boolean | null;
  adds_to_dnc: boolean | null;
  schedules_followup: boolean | null;
  default_followup_days: number | null;
  marks_as_success: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
  is_system: boolean | null;
}

export interface DialerSettingsValues {
  autoDialNext: boolean;
  delayBetweenCalls: number;
  showPreviewBeforeDial: boolean;
  playSoundOnConnect: boolean;
  connectSound: string;
  defaultMaxAttempts: number;
  defaultDaysBetweenAttempts: number;
  defaultCallingHoursStart: string;
  defaultCallingHoursEnd: string;
  defaultTimezone: string;
  defaultCallingDays: string[];
  respectDNC: boolean;
  respectTCPA: boolean;
  autoSkipRecentlyCalled: boolean;
  skipIfCalledWithinDays: number;
  enableKeyboardShortcuts: boolean;
  enableRecording: boolean;
  recordingAnnouncement: boolean;
  autoDeleteRecordingsAfterDays: number | null;
  autoTranscribe: boolean;
  recordingAccess: string;
  logCallsToGHL: boolean;
  updateGHLDisposition: boolean;
  createGHLFollowupTasks: boolean;
  createCalendarEvents: boolean;
  sendCalendarInvite: boolean;
  addCalendarReminder: boolean;
  emailDailySummary: boolean;
  dailySummaryTime: string;
}

export const defaultSettings: DialerSettingsValues = {
  autoDialNext: true,
  delayBetweenCalls: 5,
  showPreviewBeforeDial: false,
  playSoundOnConnect: true,
  connectSound: "chime",
  defaultMaxAttempts: 3,
  defaultDaysBetweenAttempts: 2,
  defaultCallingHoursStart: "09:00",
  defaultCallingHoursEnd: "20:00",
  defaultTimezone: "America/New_York",
  defaultCallingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  respectDNC: true,
  respectTCPA: true,
  autoSkipRecentlyCalled: true,
  skipIfCalledWithinDays: 7,
  enableKeyboardShortcuts: true,
  enableRecording: true,
  recordingAnnouncement: true,
  autoDeleteRecordingsAfterDays: 90,
  autoTranscribe: false,
  recordingAccess: "admins",
  logCallsToGHL: true,
  updateGHLDisposition: true,
  createGHLFollowupTasks: true,
  createCalendarEvents: true,
  sendCalendarInvite: true,
  addCalendarReminder: true,
  emailDailySummary: true,
  dailySummaryTime: "18:00",
};

export type DispositionCategoryVariant = "success" | "destructive" | "secondary" | "warning" | "info";

export const getCategoryBadge = (category: string): DispositionCategoryVariant => {
  const variants: Record<string, DispositionCategoryVariant> = {
    positive: "success",
    negative: "destructive",
    neutral: "secondary",
    no_contact: "warning",
    bad_number: "info",
  };
  return variants[category] || "secondary";
};

