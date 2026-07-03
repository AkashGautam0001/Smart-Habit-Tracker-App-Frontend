import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserIcon, TimerIcon, PaletteIcon, BellIcon, TargetIcon, CrownIcon, PlusIcon, TrashIcon, CheckCircleIcon, WarningIcon } from "@phosphor-icons/react";
import { useAuthStore } from "../store/authStore";
import { usersApi } from "../api/users";
import { aiApi } from "../api/ai";
import { toast } from "../store/toastStore";
import { THEMES } from "../config/theme.config";
import { downloadExport } from "../api/export";
import { useSubscriptionStatus, useCancelSubscription } from "../hooks/useSubscription";
import { usePlan } from "../hooks/usePlan";
import { PLANS } from "../config/plans.config";
import { APP_CONFIG } from "../config/app.config";
import type { UserSettings } from "../types";
import PageShell from "@/components/shared/PageShell";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Tab = "profile" | "timer" | "appearance" | "notifications" | "goals" | "subscription";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "timer", label: "Timer", icon: TimerIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "notifications", label: "Notifications", icon: BellIcon },
  { id: "goals", label: "Goals", icon: TargetIcon },
  { id: "subscription", label: "Subscription", icon: CrownIcon },
];

const ACCENT_COLORS = [
  { label: "Indigo", value: "#6366f1", className: "bg-indigo-500" },
  { label: "Violet", value: "#8b5cf6", className: "bg-violet-500" },
  { label: "Cyan", value: "#06b6d4", className: "bg-cyan-500" },
  { label: "Emerald", value: "#10b981", className: "bg-emerald-500" },
  { label: "Amber", value: "#f59e0b", className: "bg-amber-500" },
  { label: "Rose", value: "#f43f5e", className: "bg-rose-500" },
];

const THEME_PREVIEW: Record<string, { card: string; label: string; dots: [string, string, string] }> = {
  default: { card: "bg-zinc-950 border-zinc-800", label: "text-zinc-50", dots: ["bg-indigo-500", "bg-green-500", "bg-amber-500"] },
  amoled: { card: "bg-black border-zinc-800", label: "text-white", dots: ["bg-indigo-500", "bg-green-500", "bg-amber-500"] },
  ocean: { card: "bg-slate-900 border-slate-700", label: "text-sky-50", dots: ["bg-cyan-500", "bg-green-500", "bg-amber-500"] },
  purple: { card: "bg-purple-950 border-purple-800", label: "text-purple-50", dots: ["bg-purple-500", "bg-green-500", "bg-amber-500"] },
  green: { card: "bg-green-950 border-green-900", label: "text-green-50", dots: ["bg-green-500", "bg-emerald-400", "bg-amber-500"] },
  dracula: { card: "bg-[#282a36] border-[#44475a]", label: "text-[#f8f8f2]", dots: ["bg-pink-500", "bg-green-500", "bg-amber-500"] },
  light: { card: "bg-white border-zinc-200", label: "text-zinc-900", dots: ["bg-indigo-500", "bg-green-500", "bg-amber-500"] },
};

const SUBJECT_COLOR_BG: Record<string, string> = {
  "#6366f1": "bg-indigo-500",
  "#8b5cf6": "bg-violet-500",
  "#06b6d4": "bg-cyan-500",
  "#10b981": "bg-emerald-500",
  "#f59e0b": "bg-amber-500",
  "#f43f5e": "bg-rose-500",
  "#22c55e": "bg-green-500",
  "#ef4444": "bg-red-500",
};

function subjectColorClass(color: string) {
  return SUBJECT_COLOR_BG[color.toLowerCase()] ?? "bg-primary";
}

function SaveRow({ onSave, isPending, saved }: { onSave: () => void; isPending: boolean; saved: boolean }) {
  return (
    <div className="mt-1 flex items-center gap-3">
      <motion.div whileTap={{ scale: 0.97 }} className="inline-flex">
        <Button onClick={onSave} disabled={isPending} size="sm">
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </motion.div>
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5"
          >
            <CheckCircleIcon size={15} className="text-green-500" />
            <span className="text-sm text-green-500">Saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[0.73rem] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function OptionButtons<T extends string>({
  value,
  options,
  onChange,
  formatLabel,
}: {
  value: T;
  options: T[];
  onChange: (value: T) => void;
  formatLabel?: (value: T) => string;
}) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <Button
          key={option}
          type="button"
          variant={value === option ? "default" : "outline"}
          className="flex-1"
          size="sm"
          onClick={() => onChange(option)}
        >
          {formatLabel ? formatLabel(option) : option}
        </Button>
      ))}
    </div>
  );
}

export default function Settings() {
  const [tab, setTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [savedTab, setSavedTab] = useState<Tab | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const { isPro } = usePlan();

  const { data: subStatus } = useSubscriptionStatus();
  const cancelSub = useCancelSubscription();

  // Local form state
  const [name, setName] = useState(user?.name ?? "");
  const [timezone, setTimezone] = useState(user?.settings?.subjects ? user.timezone : "Asia/Kolkata");

  const s = user?.settings;
  const [focusMin, setFocusMin] = useState(s?.pomodoroFocusMin ?? 25);
  const [shortMin, setShortMin] = useState(s?.shortBreakMin ?? 5);
  const [longMin, setLongMin] = useState(s?.longBreakMin ?? 15);
  const [sessions, setSessions] = useState(s?.sessionsUntilLongBreak ?? 4);
  const [autoBreaks, setAutoBreaks] = useState(s?.autoStartBreaks ?? false);
  const [autoFocus, setAutoFocus] = useState(s?.autoStartNextFocus ?? false);

  const [accentColor, setAccentColor] = useState(s?.accentColor ?? "#6366f1");
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">(s?.fontSize ?? "md");
  const [clockFormat, setClockFormat] = useState<"12h" | "24h">(s?.clockFormat ?? "12h");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(s?.sidebarCollapsed ?? false);
  const [theme, setTheme] = useState(s?.theme ?? "default");

  const [notifs, setNotifs] = useState(s?.notificationsEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(s?.dailyReminderTime ?? "20:00");
  const [weeklyReport, setWeeklyReport] = useState(s?.weeklyReportEnabled ?? true);

  const [focusGoal, setFocusGoal] = useState(s?.dailyGoalHours ?? 4);
  const [habitGoal, setHabitGoal] = useState(s?.dailyHabitGoal ?? 5);
  const [subjects, setSubjects] = useState(s?.subjects ?? []);
  const [newSubject, setNewSubject] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");

  const [smartReminder, setSmartReminder] = useState("");
  const [reminderLoading, setReminderLoading] = useState(false);

  const [exportFrom, setExportFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [exportTo, setExportTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type: "habits" | "sessions" | "tasks") => {
    setExporting(true);
    try {
      await downloadExport(type, exportFrom, exportTo);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} exported`);
    } catch {
      toast.error("Export failed — please try again");
    } finally {
      setExporting(false);
    }
  };

  // Sync from user on mount
  useEffect(() => {
    if (user) {
      setName(user.name);
      setTimezone(user.timezone ?? "Asia/Kolkata");
    }
  }, [user]);

  const markSaved = (t: Tab) => {
    setSavedTab(t);
    setTimeout(() => setSavedTab(null), 2500);
  };

  const doSave = async (payload: Partial<UserSettings>, isProfile = false) => {
    setSaving(true);
    try {
      let updatedUser = user!;
      if (isProfile) {
        const r = await usersApi.updateProfile({ name, timezone });
        updatedUser = r.data.data.user;
      } else {
        const r = await usersApi.updateSettings(payload);
        updatedUser = r.data.data.user;
      }
      setUser(updatedUser);
      markSaved(tab);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = () => {
    const label = newSubject.trim();
    if (!label) return;
    const id = label.toLowerCase().replace(/\s+/g, "-");
    setSubjects((prev) => [...prev, { id, label, color: newColor }]);
    setNewSubject("");
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCancel = async () => {
    await cancelSub.mutateAsync();
    setCancelConfirm(false);
  };

  return (
    <>
      <Helmet>
        <title>Settings | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell narrow className="max-w-[740px]">
        <PageHeader title="Settings" />

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          orientation="vertical"
          className="flex flex-col gap-5 sm:flex-row sm:items-start"
        >
          <TabsList variant="line" className="h-auto w-full shrink-0 flex-col items-stretch sm:w-[180px]">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className="justify-start gap-2 px-3 py-2">
                <Icon size={16} weight={tab === id ? "fill" : "regular"} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0 flex-1">
            {/* ─── Profile ─── */}
            <TabsContent value="profile" className="mt-0 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                  <Section title="Profile">
                    <Field label="Display Name">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Email">
                      <Input value={user?.email ?? ""} disabled className="opacity-50" />
                    </Field>
                    <Field label="Timezone">
                      <Input
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="Asia/Kolkata"
                      />
                    </Field>
                    <SaveRow onSave={() => doSave({}, true)} isPending={saving} saved={savedTab === "profile"} />
                  </Section>

                  {isPro ? (
                    <Section
                      title="Export Data"
                      description="Download your data as CSV. Choose a date range and export by type."
                    >
                      <div className="flex flex-wrap items-end gap-2.5">
                        <Field label="From">
                          <Input
                            type="date"
                            value={exportFrom}
                            max={exportTo}
                            onChange={(e) => setExportFrom(e.target.value)}
                            className="text-[0.82rem]"
                          />
                        </Field>
                        <Field label="To">
                          <Input
                            type="date"
                            value={exportTo}
                            min={exportFrom}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => setExportTo(e.target.value)}
                            className="text-[0.82rem]"
                          />
                        </Field>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(["habits", "sessions", "tasks"] as const).map((type) => (
                          <motion.div key={type} whileTap={{ scale: 0.97 }} className="inline-flex">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExport(type)}
                              disabled={exporting}
                            >
                              {exporting ? "Exporting…" : `Export ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </Section>
                  ) : (
                    <Card>
                      <CardContent className="pt-(--card-spacing)">
                        <div className="flex items-center gap-2.5">
                          <CrownIcon size={16} weight="fill" className="text-amber-500" />
                          <span className="text-sm font-semibold">Export Data</span>
                        </div>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          Export your habits, sessions, and tasks as CSV. Available on Pro.
                        </p>
                        <motion.div whileTap={{ scale: 0.97 }} className="mt-2.5 inline-flex">
                          <Button size="sm" onClick={() => navigate("/upgrade")}>
                            Upgrade to Pro
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  )}
              </motion.div>
            </TabsContent>

            {/* ─── Timer ─── */}
            <TabsContent value="timer" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
              >
                  <Section title="Pomodoro Timer">
                    {[
                      { label: "Focus duration (minutes)", value: focusMin, set: setFocusMin, min: 5, max: 90 },
                      { label: "Short break (minutes)", value: shortMin, set: setShortMin, min: 1, max: 30 },
                      { label: "Long break (minutes)", value: longMin, set: setLongMin, min: 5, max: 60 },
                      { label: "Sessions until long break", value: sessions, set: setSessions, min: 1, max: 10 },
                    ].map(({ label, value, set, min, max }) => (
                      <Field key={label} label={label}>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={min}
                            max={max}
                            value={value}
                            onChange={(e) => set(Number(e.target.value))}
                            className="h-2 flex-1 cursor-pointer accent-primary"
                          />
                          <span className="min-w-7 text-right text-sm font-semibold tabular-nums text-foreground">
                            {value}
                          </span>
                        </div>
                      </Field>
                    ))}

                    <ToggleRow label="Auto-start breaks" checked={autoBreaks} onCheckedChange={setAutoBreaks} />
                    <ToggleRow label="Auto-start next focus" checked={autoFocus} onCheckedChange={setAutoFocus} />

                    <Field label="Clock format">
                      <OptionButtons value={clockFormat} options={["12h", "24h"]} onChange={setClockFormat} />
                    </Field>

                    <SaveRow
                      onSave={() =>
                        doSave({
                          pomodoroFocusMin: focusMin,
                          shortBreakMin: shortMin,
                          longBreakMin: longMin,
                          sessionsUntilLongBreak: sessions,
                          autoStartBreaks: autoBreaks,
                          autoStartNextFocus: autoFocus,
                          clockFormat,
                        })
                      }
                      isPending={saving}
                      saved={savedTab === "timer"}
                    />
                  </Section>
              </motion.div>
            </TabsContent>

            {/* ─── Appearance ─── */}
            <TabsContent value="appearance" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
              >
                  <Section title="Appearance">
                    <Field label="Theme">
                      <div className="grid grid-cols-3 gap-2">
                        {THEMES.map((t) => {
                          const isLocked = t.isPro && !isPro;
                          const isSelected = theme === t.id;
                          const preview = THEME_PREVIEW[t.id] ?? THEME_PREVIEW.default;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                if (isLocked) { navigate("/upgrade"); return; }
                                setTheme(t.id);
                              }}
                              title={t.label}
                              className={cn(
                                "relative flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 p-2.5 transition-all",
                                preview.card,
                                isSelected ? "border-primary ring-1 ring-primary/30" : "border-transparent opacity-90 hover:opacity-100",
                                isLocked && "opacity-65",
                              )}
                            >
                              <div className="flex gap-1">
                                {preview.dots.map((dotClass, i) => (
                                  <div key={i} className={cn("size-2 rounded-full", dotClass)} />
                                ))}
                              </div>
                              <span className={cn("text-[0.7rem]", preview.label, isSelected && "font-bold")}>
                                {t.label}
                              </span>
                              {isLocked && (
                                <Badge className="absolute right-1 top-1 bg-amber-400 px-1 py-0 text-[0.6rem] text-black hover:bg-amber-400">
                                  PRO
                                </Badge>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="Accent color">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {ACCENT_COLORS.map(({ label, value, className }) => (
                          <button
                            key={value}
                            type="button"
                            title={label}
                            onClick={() => setAccentColor(value)}
                            className={cn(
                              "size-7 shrink-0 cursor-pointer rounded-full transition-transform",
                              className,
                              accentColor === value
                                ? "scale-110 ring-2 ring-offset-2 ring-offset-background ring-white"
                                : "hover:scale-105",
                            )}
                          />
                        ))}
                        <Input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          title="Custom color"
                          className="h-8 w-9 cursor-pointer p-0.5"
                        />
                      </div>
                    </Field>

                    <Field label="Font size">
                      <Select value={fontSize} onValueChange={(v) => setFontSize(v as "sm" | "md" | "lg")}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sm">Small</SelectItem>
                          <SelectItem value="md">Medium</SelectItem>
                          <SelectItem value="lg">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <ToggleRow
                      label="Collapse sidebar by default"
                      checked={sidebarCollapsed}
                      onCheckedChange={setSidebarCollapsed}
                    />

                    <SaveRow
                      onSave={() => doSave({ accentColor, fontSize, sidebarCollapsed, theme })}
                      isPending={saving}
                      saved={savedTab === "appearance"}
                    />
                  </Section>
              </motion.div>
            </TabsContent>

            {/* ─── Notifications ─── */}
            <TabsContent value="notifications" className="mt-0 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                  <Section title="Browser Notifications">
                    <ToggleRow
                      label="Enable browser notifications"
                      checked={notifs}
                      onCheckedChange={(v) => {
                        setNotifs(v);
                        if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
                          Notification.requestPermission();
                        }
                      }}
                    />
                    <ToggleRow
                      label="Weekly productivity report"
                      checked={weeklyReport}
                      onCheckedChange={setWeeklyReport}
                    />

                    <Field label="Daily reminder time">
                      <Input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-auto max-w-[140px]"
                      />
                    </Field>

                    <SaveRow
                      onSave={() =>
                        doSave({
                          notificationsEnabled: notifs,
                          weeklyReportEnabled: weeklyReport,
                          dailyReminderTime: reminderTime,
                        })
                      }
                      isPending={saving}
                      saved={savedTab === "notifications"}
                    />
                  </Section>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">Smart Reminder</CardTitle>
                        {!isPro && (
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/15">
                            PRO
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        AI-generated reminder based on your actual study patterns and peak productivity hours.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isPro ? (
                        <>
                          {smartReminder && (
                            <div className="mb-3 rounded-lg border border-primary/25 bg-primary/5 px-3.5 py-2.5">
                              <p className="text-sm italic text-muted-foreground">
                                &ldquo;{smartReminder}&rdquo;
                              </p>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reminderLoading}
                            onClick={async () => {
                              setReminderLoading(true);
                              try {
                                const r = await aiApi.smartReminder();
                                setSmartReminder(r.data.data.reminder);
                              } finally {
                                setReminderLoading(false);
                              }
                            }}
                          >
                            {reminderLoading
                              ? "Generating…"
                              : smartReminder
                                ? "↻ Refresh reminder"
                                : "✦ Preview smart reminder"}
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => navigate("/upgrade")}>
                          Upgrade to Pro to unlock
                        </Button>
                      )}
                    </CardContent>
                  </Card>
              </motion.div>
            </TabsContent>

            {/* ─── Goals ─── */}
            <TabsContent value="goals" className="mt-0 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                  <Section title="Daily Goals">
                    {[
                      { label: "Daily focus goal (hours)", value: focusGoal, set: setFocusGoal, min: 1, max: 12 },
                      { label: "Daily habit goal (count)", value: habitGoal, set: setHabitGoal, min: 1, max: 20 },
                    ].map(({ label, value, set, min, max }) => (
                      <Field key={label} label={label}>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={min}
                            max={max}
                            value={value}
                            onChange={(e) => set(Number(e.target.value))}
                            className="h-2 flex-1 cursor-pointer accent-primary"
                          />
                          <span className="min-w-6 text-right text-sm font-semibold text-foreground">
                            {value}
                          </span>
                        </div>
                      </Field>
                    ))}
                    <SaveRow
                      onSave={() => doSave({ dailyGoalHours: focusGoal, dailyHabitGoal: habitGoal, subjects })}
                      isPending={saving}
                      saved={savedTab === "goals"}
                    />
                  </Section>

                  <Section title="Learning Subjects">
                    <div className="flex flex-col gap-1.5">
                      {subjects.map(({ id, label, color }) => (
                        <div key={id} className="flex items-center gap-2.5 py-1.5">
                          <div className={cn("size-2.5 shrink-0 rounded-full", subjectColorClass(color))} />
                          <span className="flex-1 text-sm text-foreground">{label}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleRemoveSubject(id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <TrashIcon size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="New subject…"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                        className="flex-1"
                      />
                      <Input
                        type="color"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        className="h-8 w-11 cursor-pointer p-0.5"
                      />
                      <Button type="button" size="icon" onClick={handleAddSubject}>
                        <PlusIcon size={16} />
                      </Button>
                    </div>
                    <SaveRow
                      onSave={() => doSave({ dailyGoalHours: focusGoal, dailyHabitGoal: habitGoal, subjects })}
                      isPending={saving}
                      saved={savedTab === "goals"}
                    />
                  </Section>
              </motion.div>
            </TabsContent>

            {/* ─── Subscription ─── */}
            <TabsContent value="subscription" className="mt-0 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                  <Card>
                    <CardContent className="pt-(--card-spacing)">
                      <div className="mb-4 flex items-center gap-3.5">
                        <div
                          className={cn(
                            "rounded-lg p-2.5",
                            isPro ? "bg-amber-500/15" : "bg-muted",
                          )}
                        >
                          <CrownIcon
                            size={22}
                            weight={isPro ? "fill" : "regular"}
                            className={isPro ? "text-amber-500" : "text-muted-foreground"}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{isPro ? "Pro Plan" : "Free Plan"}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {isPro && subStatus?.planExpiresAt
                              ? `Active until ${new Date(subStatus.planExpiresAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}`
                              : isPro
                                ? "Active"
                                : "10 habits · 30-day history · Basic analytics"}
                          </p>
                        </div>
                      </div>

                      {!isPro && (
                        <Button size="sm" onClick={() => navigate("/upgrade")}>
                          Upgrade to Pro — ₹{PLANS.pro.price.monthly}/mo
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {isPro && subStatus?.subscription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Billing Details</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3.5">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: "Plan", value: "Pro" },
                            {
                              label: "Billing",
                              value: subStatus.subscription.billingCycle === "yearly" ? "Yearly" : "Monthly",
                            },
                            { label: "Amount", value: `₹${(subStatus.subscription.amount / 100).toLocaleString("en-IN")}` },
                            {
                              label: "Status",
                              value:
                                subStatus.subscription.status.charAt(0).toUpperCase() +
                                subStatus.subscription.status.slice(1),
                            },
                            {
                              label: "Started",
                              value: new Date(subStatus.subscription.startDate).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }),
                            },
                            {
                              label: "Renews",
                              value:
                                subStatus.subscription.status === "cancelled"
                                  ? "Cancelled"
                                  : new Date(subStatus.subscription.endDate).toLocaleDateString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }),
                            },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p className="mb-0.5 text-[0.72rem] text-muted-foreground">{label}</p>
                              <p className="text-sm font-medium text-foreground">{value}</p>
                            </div>
                          ))}
                        </div>

                        {subStatus.subscription.status === "active" && (
                          <>
                            <Separator />
                            {!cancelConfirm ? (
                              <Button
                                type="button"
                                variant="link"
                                className="h-auto p-0 text-destructive hover:text-destructive"
                                onClick={() => setCancelConfirm(true)}
                              >
                                Cancel subscription
                              </Button>
                            ) : (
                              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3.5">
                                <div className="mb-3 flex items-start gap-2.5">
                                  <WarningIcon size={18} className="mt-0.5 shrink-0 text-destructive" />
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">Cancel subscription?</p>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                      Pro access continues until{" "}
                                      {subStatus.planExpiresAt
                                        ? new Date(subStatus.planExpiresAt).toLocaleDateString("en-IN", {
                                            month: "long",
                                            day: "numeric",
                                          })
                                        : "expiry"}
                                      . You won&apos;t be charged again.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleCancel}
                                    disabled={cancelSub.isPending}
                                  >
                                    {cancelSub.isPending ? "Cancelling…" : "Yes, cancel"}
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => setCancelConfirm(false)}>
                                    Keep Pro
                                  </Button>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
              </motion.div>
            </TabsContent>
          </div>
        </Tabs>
      </PageShell>
    </>
  );
}
