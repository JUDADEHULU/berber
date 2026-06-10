import { useState, useMemo, useCallback } from "react";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6",
  "#ec4899", "#8b5cf6", "#14b8a6", "#f97316", "#06b6d4",
];

const today = new Date();
const TODAY_KEY = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let startWeekday = firstDay.getDay();
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1;
  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return { days, daysInMonth };
}

function dateKey(year, month, day) {
  return `${year}-${month}-${day}`;
}

const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

export default function HabitTracker() {
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [habits, setHabits] = useState([
    { id: 1, name: "运动", color: COLORS[0], icon: "🏃" },
    { id: 2, name: "阅读", color: COLORS[1], icon: "📖" },
    { id: 3, name: "早睡", color: COLORS[2], icon: "🌙" },
  ]);
  const [records, setRecords] = useState({});
  const [newHabit, setNewHabit] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [nextId, setNextId] = useState(4);
  const [colorIdx, setColorIdx] = useState(3);

  const { days, daysInMonth } = useMemo(() => getMonthData(year, month), [year, month]);

  const toggleRecord = useCallback((day, habitId) => {
    const key = dateKey(year, month, day);
    setRecords((prev) => {
      const dayRecords = prev[key] || {};
      return { ...prev, [key]: { ...dayRecords, [habitId]: !dayRecords[habitId] } };
    });
  }, [year, month]);

  const addHabit = useCallback(() => {
    const name = newHabit.trim();
    if (!name) return;
    const color = COLORS[colorIdx % COLORS.length];
    setHabits((prev) => [...prev, { id: nextId, name, color, icon: "✨" }]);
    setNextId((n) => n + 1);
    setColorIdx((c) => c + 1);
    setNewHabit("");
    setShowAddHabit(false);
  }, [newHabit, nextId, colorIdx]);

  const removeHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setRecords((prev) => {
      const next = {};
      for (const [k, v] of Object.entries(prev)) {
        const copy = { ...v };
        delete copy[id];
        next[k] = copy;
      }
      return next;
    });
  }, []);

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
    setSelectedDay(null);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const getDayCompletionRate = (day) => {
    if (!day || habits.length === 0) return 0;
    const key = dateKey(year, month, day);
    const dayRecords = records[key] || {};
    const done = habits.filter((h) => dayRecords[h.id]).length;
    return done / habits.length;
  };

  const getHabitStats = (habitId) => {
    let done = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = dateKey(year, month, d);
      if (records[key] && records[key][habitId]) done++;
    }
    return done;
  };

  const totalStats = useMemo(() => {
    let totalChecks = 0;
    let totalPossible = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (d > today.getDate() && year === today.getFullYear() && month === today.getMonth()) continue;
      const key = dateKey(year, month, d);
      for (const h of habits) {
        totalPossible++;
        if (records[key] && records[key][h.id]) totalChecks++;
      }
    }
    return { totalChecks, totalPossible, rate: totalPossible ? Math.round((totalChecks / totalPossible) * 100) : 0 };
  }, [year, month, habits, records, daysInMonth]);

  const getDayDotColors = (day) => {
    if (!day) return [];
    const key = dateKey(year, month, day);
    const dayRecords = records[key] || {};
    return habits.filter((h) => dayRecords[h.id]).map((h) => h.color);
  };

  const isToday = (day) =>
    day && year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  const selectedKey = selectedDay ? dateKey(year, month, selectedDay) : null;
  const selectedRecords = selectedKey ? records[selectedKey] || {} : {};

  return (
    <div style={{
      fontFamily: "'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
      maxWidth: 520, margin: "0 auto", padding: "24px 16px",
      background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
      minHeight: "100vh", color: "#1e293b",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: "#4338ca" }}>
          📅 习惯打卡日历
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "6px 0 0" }}>
          坚持每一天，遇见更好的自己
        </p>
      </div>

      {/* Month Navigation */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", borderRadius: 14, padding: "12px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 16,
      }}>
        <button onClick={prevMonth} style={navBtn}>◀</button>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#4338ca" }}>
            {year}年 {MONTH_NAMES[month]}
          </span>
        </div>
        <button onClick={nextMonth} style={navBtn}>▶</button>
      </div>

      {/* Today Button */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <button onClick={goToday} style={{
          background: "#4338ca", color: "#fff", border: "none",
          borderRadius: 20, padding: "5px 18px", fontSize: 13,
          cursor: "pointer", fontWeight: 600,
        }}>回到今天</button>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 16,
      }}>
        <div style={statCard}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#4338ca" }}>{totalStats.rate}%</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>本月完成率</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>{totalStats.totalChecks}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>已打卡次数</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f59e0b" }}>{habits.length}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>追踪习惯数</div>
        </div>
      </div>

      {/* Habit Tags */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16,
        background: "#fff", borderRadius: 14, padding: 14,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        {habits.map((h) => {
          const count = getHabitStats(h.id);
          return (
            <div key={h.id} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: `${h.color}14`, border: `1.5px solid ${h.color}40`,
              borderRadius: 20, padding: "5px 12px", fontSize: 13,
            }}>
              <span>{h.icon}</span>
              <span style={{ fontWeight: 600, color: h.color }}>{h.name}</span>
              <span style={{
                background: h.color, color: "#fff", borderRadius: 10,
                padding: "1px 7px", fontSize: 11, fontWeight: 700,
              }}>{count}</span>
              <button onClick={() => removeHabit(h.id)} style={{
                background: "none", border: "none", color: "#cbd5e1",
                cursor: "pointer", fontSize: 14, padding: 0, lineHeight: 1,
              }} title="删除">×</button>
            </div>
          );
        })}
        {showAddHabit ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              placeholder="习惯名称"
              autoFocus
              style={{
                border: "1.5px solid #c7d2fe", borderRadius: 12,
                padding: "5px 10px", fontSize: 13, width: 90, outline: "none",
              }}
            />
            <button onClick={addHabit} style={{
              background: "#4338ca", color: "#fff", border: "none",
              borderRadius: 12, padding: "5px 10px", fontSize: 12,
              cursor: "pointer", fontWeight: 600,
            }}>确定</button>
            <button onClick={() => setShowAddHabit(false)} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 12, padding: "5px 10px", fontSize: 12, cursor: "pointer",
            }}>取消</button>
          </div>
        ) : (
          <button onClick={() => setShowAddHabit(true)} style={{
            background: "#f1f5f9", border: "1.5px dashed #c7d2fe",
            borderRadius: 20, padding: "5px 14px", fontSize: 13,
            color: "#6366f1", cursor: "pointer", fontWeight: 600,
          }}>+ 添加习惯</button>
        )}
      </div>

      {/* Calendar Grid */}
      <div style={{
        background: "#fff", borderRadius: 16, padding: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16,
      }}>
        {/* Weekday Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
          {WEEKDAYS.map((w, i) => (
            <div key={w} style={{
              textAlign: "center", fontSize: 12, fontWeight: 700,
              color: i >= 5 ? "#f59e0b" : "#94a3b8", padding: "4px 0",
            }}>{w}</div>
          ))}
        </div>

        {/* Day Cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {days.map((day, idx) => {
            const rate = getDayCompletionRate(day);
            const isSelected = selectedDay === day;
            const isTodayCell = isToday(day);
            const dots = getDayDotColors(day);

            let bgColor = "#fafbfc";
            if (day) {
              if (rate === 1) bgColor = "#dcfce7";
              else if (rate >= 0.5) bgColor = "#fef9c3";
              else if (rate > 0) bgColor = "#fef3c7";
            }

            return (
              <div
                key={idx}
                onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                style={{
                  aspectRatio: "1", display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  borderRadius: 12, cursor: day ? "pointer" : "default",
                  background: isSelected ? "#4338ca" : bgColor,
                  border: isTodayCell && !isSelected ? "2px solid #4338ca" : "2px solid transparent",
                  transition: "all 0.15s ease",
                  position: "relative",
                  boxShadow: isSelected ? "0 2px 8px rgba(67,56,202,0.3)" : "none",
                }}
              >
                {day && (
                  <>
                    <span style={{
                      fontSize: 15, fontWeight: isTodayCell ? 800 : 600,
                      color: isSelected ? "#fff" : rate === 1 ? "#16a34a" : "#475569",
                    }}>{day}</span>
                    {rate === 1 && !isSelected && (
                      <span style={{ fontSize: 10, position: "absolute", top: 3, right: 5 }}>✓</span>
                    )}
                    {dots.length > 0 && !isSelected && (
                      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {dots.slice(0, 4).map((c, i) => (
                          <div key={i} style={{
                            width: 5, height: 5, borderRadius: "50%", background: c,
                          }} />
                        ))}
                        {dots.length > 4 && (
                          <span style={{ fontSize: 8, color: "#94a3b8" }}>+{dots.length - 4}</span>
                        )}
                      </div>
                    )}
                    {isSelected && dots.length > 0 && (
                      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        {dots.slice(0, 4).map((c, i) => (
                          <div key={i} style={{
                            width: 5, height: 5, borderRadius: "50%", background: "#fff",
                          }} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#fafbfc", border: "1px solid #e2e8f0", verticalAlign: "middle", marginRight: 4 }} />未打卡</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#fef3c7", verticalAlign: "middle", marginRight: 4 }} />部分</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "#dcfce7", verticalAlign: "middle", marginRight: 4 }} />全部完成</span>
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 18,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#4338ca", marginBottom: 14 }}>
            {month + 1}月{selectedDay}日 打卡详情
          </div>
          {habits.length === 0 && (
            <div style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", padding: 16 }}>
              暂无追踪的习惯，请先添加习惯
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {habits.map((h) => {
              const checked = !!selectedRecords[h.id];
              return (
                <div
                  key={h.id}
                  onClick={() => toggleRecord(selectedDay, h.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 14px", borderRadius: 12,
                    background: checked ? `${h.color}12` : "#f8fafc",
                    border: checked ? `1.5px solid ${h.color}50` : "1.5px solid #e2e8f0",
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: checked ? h.color : "#e2e8f0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    transition: "all 0.15s ease",
                  }}>
                    {checked ? "✓" : ""}
                  </div>
                  <span style={{
                    fontSize: 15, fontWeight: 600, flex: 1,
                    color: checked ? h.color : "#64748b",
                    textDecoration: checked ? "none" : "none",
                  }}>
                    {h.icon} {h.name}
                  </span>
                  {checked && (
                    <span style={{ fontSize: 11, color: h.color, fontWeight: 600 }}>已完成</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Habit Stats Bar */}
      {habits.length > 0 && (
        <div style={{
          background: "#fff", borderRadius: 16, padding: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#4338ca", marginBottom: 12 }}>
            本月习惯统计
          </div>
          {habits.map((h) => {
            const count = getHabitStats(h.id);
            const pct = Math.round((count / daysInMonth) * 100);
            return (
              <div key={h.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{h.icon} {h.name}</span>
                  <span style={{ color: h.color, fontWeight: 700 }}>{count}/{daysInMonth}天 ({pct}%)</span>
                </div>
                <div style={{
                  height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, background: h.color,
                    borderRadius: 4, transition: "width 0.3s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#cbd5e1" }}>
        点击日期查看详情 · 点击习惯切换打卡状态
      </div>
    </div>
  );
}

const navBtn = {
  background: "#f1f5f9", border: "none", borderRadius: 10,
  width: 34, height: 34, cursor: "pointer", fontSize: 14,
  display: "flex", alignItems: "center", justifyContent: "center",
  color: "#4338ca", fontWeight: 700,
};

const statCard = {
  flex: 1, background: "#fff", borderRadius: 14, padding: "12px 8px",
  textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};
