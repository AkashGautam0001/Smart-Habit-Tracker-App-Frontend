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
  { label: "Indigo", value: "#6366f1" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Cyan", value: "#06b6d4" },
  { label: "Emerald", value: "#10b981" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Rose", value: "#f43f5e" },
];

function SaveRow({ onSave, isPending, saved }: { onSave: () => void; isPending: boolean; saved: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onSave}
        disabled={isPending}
        className="btn btn-primary"
        style={{ minHeight: "auto", padding: "8px 20px", fontSize: "0.875rem" }}>
        {isPending ? "Saving…" : "Save Changes"}
      </motion.button>
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            style={{ alignItems: "center", display: "flex", gap: 5 }}>
            <CheckCircleIcon size={15} color="var(--color-success)" />
            <span style={{ color: "var(--color-success)", fontSize: "0.8rem" }}>Saved</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem", fontWeight: 500 }}>{label}</label>
      {children}
      {hint && <p style={{ color: "var(--color-text-muted)", fontSize: "0.73rem" }}>{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ color: "var(--color-text)", fontSize: "0.9rem", fontWeight: 600 }}>{title}</h2>
      {children}
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

      <div
        style={{ display: "grid", gap: 20, gridTemplateColumns: "180px 1fr", maxWidth: 740, alignItems: "start" }}
        className="settings-grid">
        {/* Tab sidebar */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                alignItems: "center",
                background: tab === id ? "color-mix(in srgb, var(--color-accent) 12%, transparent)" : "transparent",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: tab === id ? "var(--color-accent)" : "var(--color-text-secondary)",
                cursor: "pointer",
                display: "flex",
                fontWeight: tab === id ? 600 : 400,
                gap: 8,
                minHeight: "auto",
                padding: "9px 12px",
                fontSize: "0.875rem",
                textAlign: "left",
                transition: "all 0.12s",
                width: "100%",
              }}>
              <Icon size={16} weight={tab === id ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* ─── Profile ─── */}
            {tab === "profile" && (
              <>
              <Section title="Profile">
                <Field label="Display Name">
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Email">
                  <input
                    className="input"
                    value={user?.email ?? ""}
                    disabled
                    style={{ opacity: 0.5, cursor: "not-allowed" }}
                  />
                </Field>
                <Field label="Timezone">
                  <input
                    className="input"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    placeholder="Asia/Kolkata"
                  />
                </Field>
                <SaveRow onSave={() => doSave({}, true)} isPending={saving} saved={savedTab === "profile"} />
              </Section>

              {/* Export Data */}
              {isPro ? (
                <Section title="Export Data">
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                    Download your data as CSV. Choose a date range and export by type.
                  </p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Field label="From">
                      <input
                        type="date"
                        value={exportFrom}
                        max={exportTo}
                        onChange={(e) => setExportFrom(e.target.value)}
                        className="input"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </Field>
                    <Field label="To">
                      <input
                        type="date"
                        value={exportTo}
                        min={exportFrom}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setExportTo(e.target.value)}
                        className="input"
                        style={{ fontSize: "0.82rem" }}
                      />
                    </Field>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["habits", "sessions", "tasks"] as const).map((type) => (
                      <motion.button
                        key={type}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleExport(type)}
                        disabled={exporting}
                        className="btn"
                        style={{
                          background: "var(--color-surface-hover)",
                          border: "1px solid var(--color-border)",
                          fontSize: "0.82rem",
                          minHeight: "auto",
                          padding: "7px 14px",
                        }}
                      >
                        {exporting ? "Exporting…" : `Export ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                      </motion.button>
                    ))}
                  </div>
                </Section>
              ) : (
                <div className="card" style={{ padding: "16px 18px" }}>
                  <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                    <CrownIcon size={16} weight="fill" color="var(--color-warning)" />
                    <span style={{ color: "var(--color-text)", fontSize: "0.85rem", fontWeight: 600 }}>
                      Export Data
                    </span>
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.78rem", marginTop: 6 }}>
                    Export your habits, sessions, and tasks as CSV. Available on Pro.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/upgrade")}
                    className="btn btn-primary"
                    style={{ fontSize: "0.82rem", marginTop: 10, minHeight: "auto", padding: "7px 14px" }}
                  >
                    Upgrade to Pro
                  </motion.button>
                </div>
              )}
              </>
            )}

            {/* ─── Timer ─── */}
            {tab === "timer" && (
              <Section title="Pomodoro Timer">
                {[
                  { label: "Focus duration (minutes)", value: focusMin, set: setFocusMin, min: 5, max: 90 },
                  { label: "Short break (minutes)", value: shortMin, set: setShortMin, min: 1, max: 30 },
                  { label: "Long break (minutes)", value: longMin, set: setLongMin, min: 5, max: 60 },
                  { label: "Sessions until long break", value: sessions, set: setSessions, min: 1, max: 10 },
                ].map(({ label, value, set, min, max }) => (
                  <Field key={label} label={label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={(e) => set(Number(e.target.value))}
                        style={{ flex: 1, accentColor: "var(--color-accent)" }}
                      />
                      <span
                        style={{
                          color: "var(--color-text)",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          minWidth: 28,
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                        {value}
                      </span>
                    </div>
                  </Field>
                ))}

                {[
                  { label: "Auto-start breaks", value: autoBreaks, set: setAutoBreaks },
                  { label: "Auto-start next focus", value: autoFocus, set: setAutoFocus },
                ].map(({ label, value, set }) => (
                  <div
                    key={label}
                    style={{ alignItems: "center", display: "flex", gap: 12, justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>{label}</span>
                    <button
                      onClick={() => set(!value)}
                      style={{
                        background: value ? "var(--color-accent)" : "var(--color-surface-hover)",
                        border: `2px solid ${value ? "var(--color-accent)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-full)",
                        cursor: "pointer",
                        height: 24,
                        width: 44,
                        minHeight: "auto",
                        minWidth: "auto",
                        position: "relative",
                        transition: "all 0.2s",
                      }}>
                      <span
                        style={{
                          background: "#fff",
                          borderRadius: "50%",
                          height: 16,
                          width: 16,
                          position: "absolute",
                          top: 2,
                          left: value ? 22 : 2,
                          transition: "left 0.2s",
                        }}
                      />
                    </button>
                  </div>
                ))}

                <Field label="Clock format">
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["12h", "24h"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setClockFormat(f)}
                        style={{
                          background: clockFormat === f ? "var(--color-accent)" : "var(--color-surface-hover)",
                          border: `1px solid ${clockFormat === f ? "var(--color-accent)" : "var(--color-border)"}`,
                          borderRadius: "var(--radius-md)",
                          color: clockFormat === f ? "#fff" : "var(--color-text-secondary)",
                          cursor: "pointer",
                          flex: 1,
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          minHeight: "auto",
                          padding: "7px 0",
                        }}>
                        {f}
                      </button>
                    ))}
                  </div>
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
            )}

            {/* ─── Appearance ─── */}
            {tab === "appearance" && (
              <Section title="Appearance">
                <Field label="Theme">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {THEMES.map((t) => {
                      const isLocked = t.isPro && !isPro;
                      const isSelected = theme === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            if (isLocked) { navigate("/upgrade"); return; }
                            setTheme(t.id);
                          }}
                          title={t.label}
                          style={{
                            alignItems: "center",
                            background: t.vars["--color-surface"],
                            border: `2px solid ${isSelected ? "var(--color-accent)" : t.vars["--color-border"]}`,
                            borderRadius: "var(--radius-md)",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            minHeight: "auto",
                            minWidth: "auto",
                            opacity: isLocked ? 0.65 : 1,
                            padding: "10px 8px",
                            position: "relative",
                            transition: "all 0.15s",
                          }}
                        >
                          {/* Preview dots */}
                          <div style={{ display: "flex", gap: 4 }}>
                            {[t.vars["--color-accent"], t.vars["--color-success"], t.vars["--color-warning"]].map((c, i) => (
                              <div key={i} style={{ background: c, borderRadius: "50%", height: 8, width: 8 }} />
                            ))}
                          </div>
                          <span style={{ color: t.vars["--color-text"], fontSize: "0.7rem", fontWeight: isSelected ? 700 : 400 }}>
                            {t.label}
                          </span>
                          {isLocked && (
                            <span style={{
                              background: "rgba(251,191,36,0.9)", borderRadius: 3,
                              color: "#000", fontSize: "0.6rem", fontWeight: 700,
                              padding: "1px 4px", position: "absolute", right: 4, top: 4,
                            }}>PRO</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label="Accent color">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                    {ACCENT_COLORS.map(({ label, value }) => (
                      <button
                        key={value}
                        title={label}
                        onClick={() => setAccentColor(value)}
                        style={{
                          background: value,
                          border: `3px solid ${accentColor === value ? "#fff" : "transparent"}`,
                          borderRadius: "50%",
                          cursor: "pointer",
                          height: 30,
                          width: 30,
                          minHeight: "auto",
                          minWidth: "auto",
                          outline: accentColor === value ? `2px solid ${value}` : "none",
                          outlineOffset: 2,
                          transition: "transform 0.12s",
                          transform: accentColor === value ? "scale(1.15)" : "scale(1)",
                        }}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      title="Custom color"
                      style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        cursor: "pointer",
                        height: 30,
                        padding: 2,
                        width: 36,
                      }}
                    />
                  </div>
                </Field>

                <Field label="Font size">
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["sm", "md", "lg"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFontSize(f)}
                        style={{
                          background: fontSize === f ? "var(--color-accent)" : "var(--color-surface-hover)",
                          border: `1px solid ${fontSize === f ? "var(--color-accent)" : "var(--color-border)"}`,
                          borderRadius: "var(--radius-md)",
                          color: fontSize === f ? "#fff" : "var(--color-text-secondary)",
                          cursor: "pointer",
                          flex: 1,
                          fontSize: { sm: "0.8rem", md: "0.875rem", lg: "1rem" }[f],
                          fontWeight: 500,
                          minHeight: "auto",
                          padding: "7px 0",
                        }}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </Field>

                <div style={{ alignItems: "center", display: "flex", gap: 12, justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
                    Collapse sidebar by default
                  </span>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                      background: sidebarCollapsed ? "var(--color-accent)" : "var(--color-surface-hover)",
                      border: `2px solid ${sidebarCollapsed ? "var(--color-accent)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-full)",
                      cursor: "pointer",
                      height: 24,
                      width: 44,
                      minHeight: "auto",
                      minWidth: "auto",
                      position: "relative",
                      transition: "all 0.2s",
                    }}>
                    <span
                      style={{
                        background: "#fff",
                        borderRadius: "50%",
                        height: 16,
                        width: 16,
                        position: "absolute",
                        top: 2,
                        left: sidebarCollapsed ? 22 : 2,
                        transition: "left 0.2s",
                      }}
                    />
                  </button>
                </div>

                <SaveRow
                  onSave={() => doSave({ accentColor, fontSize, sidebarCollapsed, theme })}
                  isPending={saving}
                  saved={savedTab === "appearance"}
                />
              </Section>
            )}

            {/* ─── Notifications ─── */}
            {tab === "notifications" && (
              <>
                <Section title="Browser Notifications">
                  {[
                    {
                      label: "Enable browser notifications",
                      value: notifs,
                      set: (v: boolean) => {
                        setNotifs(v);
                        if (v && typeof Notification !== "undefined" && Notification.permission === "default") {
                          Notification.requestPermission();
                        }
                      },
                    },
                    { label: "Weekly productivity report", value: weeklyReport, set: setWeeklyReport },
                  ].map(({ label, value, set }) => (
                    <div
                      key={label}
                      style={{ alignItems: "center", display: "flex", gap: 12, justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>{label}</span>
                      <button
                        onClick={() => set(!value)}
                        style={{
                          background: value ? "var(--color-accent)" : "var(--color-surface-hover)",
                          border: `2px solid ${value ? "var(--color-accent)" : "var(--color-border)"}`,
                          borderRadius: "var(--radius-full)",
                          cursor: "pointer",
                          height: 24,
                          width: 44,
                          minHeight: "auto",
                          minWidth: "auto",
                          position: "relative",
                          transition: "all 0.2s",
                        }}>
                        <span
                          style={{
                            background: "#fff",
                            borderRadius: "50%",
                            height: 16,
                            width: 16,
                            position: "absolute",
                            top: 2,
                            left: value ? 22 : 2,
                            transition: "left 0.2s",
                          }}
                        />
                      </button>
                    </div>
                  ))}

                  <Field label="Daily reminder time">
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="input"
                      style={{ width: "auto", maxWidth: 140 }}
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

                {/* AI Smart Reminder — Pro only */}
                <div className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ alignItems: "center", display: "flex", gap: 8, marginBottom: 8 }}>
                    <h2 style={{ color: "var(--color-text)", fontSize: "0.9rem", fontWeight: 600 }}>Smart Reminder</h2>
                    {!isPro && (
                      <span
                        style={{
                          alignItems: "center",
                          background: "rgba(251,191,36,0.15)",
                          borderRadius: 4,
                          color: "#fbbf24",
                          display: "inline-flex",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                        }}>
                        PRO
                      </span>
                    )}
                  </div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginBottom: 12 }}>
                    AI-generated reminder based on your actual study patterns and peak productivity hours.
                  </p>

                  {isPro ? (
                    <>
                      {smartReminder && (
                        <div
                          style={{
                            background: "color-mix(in srgb, var(--color-accent) 8%, var(--color-surface))",
                            border: "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
                            borderRadius: "var(--radius-md)",
                            marginBottom: 12,
                            padding: "10px 14px",
                          }}>
                          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", fontStyle: "italic" }}>
                            "{smartReminder}"
                          </p>
                        </div>
                      )}
                      <button
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
                        style={{
                          background: "var(--color-surface-hover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-md)",
                          color: "var(--color-text-secondary)",
                          cursor: "pointer",
                          fontSize: "0.82rem",
                          padding: "7px 14px",
                          opacity: reminderLoading ? 0.6 : 1,
                        }}>
                        {reminderLoading
                          ? "Generating…"
                          : smartReminder
                            ? "↻ Refresh reminder"
                            : "✦ Preview smart reminder"}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate("/upgrade")}
                      style={{
                        background: "var(--color-surface-hover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--color-text-muted)",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                        padding: "7px 14px",
                      }}>
                      Upgrade to Pro to unlock
                    </button>
                  )}
                </div>
              </>
            )}

            {/* ─── Goals ─── */}
            {tab === "goals" && (
              <>
                <Section title="Daily Goals">
                  {[
                    { label: "Daily focus goal (hours)", value: focusGoal, set: setFocusGoal, min: 1, max: 12 },
                    { label: "Daily habit goal (count)", value: habitGoal, set: setHabitGoal, min: 1, max: 20 },
                  ].map(({ label, value, set, min, max }) => (
                    <Field key={label} label={label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={value}
                          onChange={(e) => set(Number(e.target.value))}
                          style={{ flex: 1, accentColor: "var(--color-accent)" }}
                        />
                        <span
                          style={{
                            color: "var(--color-text)",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            minWidth: 24,
                            textAlign: "right",
                          }}>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {subjects.map(({ id, label, color }) => (
                      <div key={id} style={{ alignItems: "center", display: "flex", gap: 10, padding: "6px 0" }}>
                        <div style={{ background: color, borderRadius: "50%", flexShrink: 0, height: 10, width: 10 }} />
                        <span style={{ color: "var(--color-text)", fontSize: "0.875rem", flex: 1 }}>{label}</span>
                        <button
                          onClick={() => handleRemoveSubject(id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--color-text-muted)",
                            cursor: "pointer",
                            padding: 4,
                            minHeight: "auto",
                            minWidth: "auto",
                          }}>
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      className="input"
                      placeholder="New subject…"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      style={{
                        background: "none",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        cursor: "pointer",
                        height: 38,
                        padding: 3,
                        width: 44,
                      }}
                    />
                    <button
                      onClick={handleAddSubject}
                      className="btn btn-primary"
                      style={{ minHeight: "auto", padding: "0 14px" }}>
                      <PlusIcon size={16} />
                    </button>
                  </div>
                  <SaveRow
                    onSave={() => doSave({ dailyGoalHours: focusGoal, dailyHabitGoal: habitGoal, subjects })}
                    isPending={saving}
                    saved={savedTab === "goals"}
                  />
                </Section>
              </>
            )}

            {/* ─── Subscription ─── */}
            {tab === "subscription" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Plan status */}
                <div className="card" style={{ padding: "18px 20px" }}>
                  <div style={{ alignItems: "center", display: "flex", gap: 14, marginBottom: 16 }}>
                    <div
                      style={{
                        background: isPro
                          ? "color-mix(in srgb, var(--color-warning) 15%, transparent)"
                          : "var(--color-surface-hover)",
                        borderRadius: "var(--radius-md)",
                        padding: 10,
                      }}>
                      <CrownIcon
                        size={22}
                        weight={isPro ? "fill" : "regular"}
                        color={isPro ? "var(--color-warning)" : "var(--color-text-muted)"}
                      />
                    </div>
                    <div>
                      <p style={{ color: "var(--color-text)", fontWeight: 700 }}>{isPro ? "Pro Plan" : "Free Plan"}</p>
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
                        {isPro && subStatus?.planExpiresAt
                          ? `Active until ${new Date(subStatus.planExpiresAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}`
                          : isPro
                            ? "Active"
                            : "10 habits · 30-day history · Basic analytics"}
                      </p>
                    </div>
                  </div>

                  {!isPro && (
                    <button
                      onClick={() => navigate("/upgrade")}
                      className="btn btn-primary"
                      style={{ fontSize: "0.875rem", padding: "9px 20px", minHeight: "auto" }}>
                      Upgrade to Pro — ₹{PLANS.pro.price.monthly}/mo
                    </button>
                  )}
                </div>

                {/* Billing details */}
                {isPro && subStatus?.subscription && (
                  <div
                    className="card"
                    style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                    <h2 style={{ color: "var(--color-text)", fontSize: "0.9rem", fontWeight: 600 }}>Billing Details</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
                          <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", marginBottom: 2 }}>
                            {label}
                          </p>
                          <p style={{ color: "var(--color-text)", fontSize: "0.875rem", fontWeight: 500 }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Cancel section */}
                    {subStatus.subscription.status === "active" && (
                      <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
                        {!cancelConfirm ? (
                          <button
                            onClick={() => setCancelConfirm(true)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-danger)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              minHeight: "auto",
                              padding: 0,
                            }}>
                            Cancel subscription
                          </button>
                        ) : (
                          <div
                            style={{
                              background: "color-mix(in srgb, var(--color-danger) 8%, transparent)",
                              border: "1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)",
                              borderRadius: "var(--radius-md)",
                              padding: "14px",
                            }}>
                            <div style={{ alignItems: "flex-start", display: "flex", gap: 10, marginBottom: 12 }}>
                              <WarningIcon size={18} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: 1 }} />
                              <div>
                                <p style={{ color: "var(--color-text)", fontSize: "0.875rem", fontWeight: 600 }}>
                                  Cancel subscription?
                                </p>
                                <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 3 }}>
                                  Pro access continues until{" "}
                                  {subStatus.planExpiresAt
                                    ? new Date(subStatus.planExpiresAt).toLocaleDateString("en-IN", {
                                        month: "long",
                                        day: "numeric",
                                      })
                                    : "expiry"}
                                  . You won't be charged again.
                                </p>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={handleCancel}
                                disabled={cancelSub.isPending}
                                className="btn btn-danger"
                                style={{ fontSize: "0.8rem", minHeight: "auto", padding: "6px 14px" }}>
                                {cancelSub.isPending ? "Cancelling…" : "Yes, cancel"}
                              </button>
                              <button
                                onClick={() => setCancelConfirm(false)}
                                className="btn btn-ghost"
                                style={{ fontSize: "0.8rem", minHeight: "auto", padding: "6px 14px" }}>
                                Keep Pro
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
