import { useEffect, useMemo, useState } from "react";

const STATUS_FILTERS = ["All", "Active", "Completed"];
const CATEGORY_OPTIONS = ["Study", "Homework", "Exam", "Project", "Personal"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

function App() {
  // ---------- STATE ----------

  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem("student-tasks");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [
      {
        id: 1,
        title: "Finish DBMS assignment",
        subject: "DBMS",
        category: "Homework",
        priority: "High",
        dueDate: getISODateOffset(1),
        completed: false,
        notes: "Solve questions 1–5 from tutorial sheet.",
      },
      {
        id: 2,
        title: "Revise JavaScript array methods",
        subject: "Web Development",
        category: "Study",
        priority: "Medium",
        dueDate: getISODateOffset(0),
        completed: false,
        notes: "Map, filter, reduce practice problems.",
      },
      {
        id: 3,
        title: "Prepare DSA mock test",
        subject: "DSA",
        category: "Exam",
        priority: "High",
        dueDate: getISODateOffset(3),
        completed: false,
        notes: "Focus on trees and graphs.",
      },
    ];
  });

  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("Study");
  const [newPriority, setNewPriority] = useState("Medium");
  const [newDueDate, setNewDueDate] = useState(getISODateOffset(0));

  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // ---------- SIDE EFFECTS ----------

  useEffect(() => {
    localStorage.setItem("student-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // ---------- HELPERS ----------

  function getISODateOrNull(value) {
    if (!value) return null;
    return value;
  }

  function getDaysUntil(dueDate) {
    if (!dueDate) return null;
    const today = new Date();
    const target = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffMs = target - today;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  function getDueLabel(dueDate) {
    const days = getDaysUntil(dueDate);
    if (days === null) return "No due date";
    if (days < 0)
      return `Overdue by ${Math.abs(days)} day${
        Math.abs(days) !== 1 ? "s" : ""
      }`;
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return `Due in ${days} days`;
  }

  function getPriorityColor(priority) {
    if (priority === "High") return "#ef4444";
    if (priority === "Medium") return "#f97316";
    return "#22c55e";
  }

  function getCategoryColor(category) {
    switch (category) {
      case "Study":
        return "#03b3feff";
      case "Homework":
        return "#8b5cf6";
      case "Exam":
        return "#f97316";
      case "Project":
        return "#22c55e";
      case "Personal":
        return "#ec4899";
      default:
        return "#6b7280";
    }
  }

  // ---------- ACTIONS ----------

  const handleAddTask = () => {
    if (!newTitle.trim()) return;

    const task = {
      id: Date.now(),
      title: newTitle.trim(),
      subject: newSubject.trim() || "General",
      category: newCategory,
      priority: newPriority,
      dueDate: getISODateOrNull(newDueDate),
      completed: false,
      notes: "",
    };

    setTasks([...tasks, task]);

    setNewTitle("");
    setNewSubject("");
    setNewCategory("Study");
    setNewPriority("Medium");
    setNewDueDate(getISODateOffset(0));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleClearCompleted = () => {
    setTasks(tasks.filter((task) => !task.completed));
  };

  const handleUpdateNotes = (id, value) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, notes: value } : task
      )
    );
  };

  // ---------- DERIVED DATA ----------

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter === "Active" && task.completed) return false;
      if (statusFilter === "Completed" && !task.completed) return false;
      if (categoryFilter !== "All" && task.category !== categoryFilter)
        return false;
      return true;
    });
  }, [tasks, statusFilter, categoryFilter]);

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const todaysFocus = useMemo(() => {
    const pending = tasks.filter((t) => !t.completed);
    const sorted = [...pending].sort((a, b) => {
      const weight = { High: 3, Medium: 2, Low: 1 };
      const pa = weight[a.priority] || 0;
      const pb = weight[b.priority] || 0;
      if (pa !== pb) return pb - pa;

      const da = getDaysUntil(a.dueDate) ?? 9999;
      const db = getDaysUntil(b.dueDate) ?? 9999;
      return da - db;
    });
    return sorted.slice(0, 3);
  }, [tasks]);

  // ---------- RENDER ----------

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        background: "#0b1120",
        color: "#0f172a",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif',
      }}
    >
      {/* Navbar */}
      <header
        style={{
          width: "100%",
          borderBottom: "1px solid #1e293b",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#e5e7eb",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "6px",
              background: "linear-gradient(135deg, #6366f1, #22c55e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>
            Akash&apos;s Study Desk
          </span>
        </div>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: 12,
            color: "#93c5fd",
            textDecoration: "none",
          }}
        >
          View code on GitHub
        </a>
      </header>

      {/* Centered main area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: "30px",
          paddingBottom: "30px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "10px",
            width: "480px",
            maxWidth: "95vw",
            boxShadow: "0 18px 45px rgba(15,23,42,0.45)",
          }}
        >
          {/* Header inside card */}
          <h1 style={{ marginBottom: "4px", textAlign: "center" }}>
            Student Task Manager
          </h1>
          <p
            style={{
              marginTop: 0,
              marginBottom: "16px",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            Organise study, homework, exams, projects, and personal tasks.
          </p>

          {/* Summary */}
          <div
            style={{
              marginBottom: "16px",
              padding: "10px",
              borderRadius: "8px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                marginBottom: "8px",
              }}
            >
              <span>Total: {totalCount}</span>
              <span>Completed: {completedCount}</span>
              <span>Pending: {pendingCount}</span>
            </div>
            <div
              style={{
                height: "8px",
                borderRadius: "999px",
                background: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionPercent}%`,
                  height: "100%",
                  background: "#22c55e",
                  transition: "width 0.2s ease-out",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "4px",
                textAlign: "right",
                fontSize: "11px",
                color: "#6b7280",
              }}
            >
              {completionPercent}% completed
            </div>
          </div>

          {/* Today's focus */}
          {todaysFocus.length > 0 && (
            <div
              style={{
                marginBottom: "16px",
                padding: "10px",
                borderRadius: "8px",
                background: "#3f5254ff",
                border: "1px solid #010a10ff",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "6px",
                  color: "#e5e7eb",
                }}
              >
                Today&apos;s focus
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {todaysFocus.map((task) => (
                  <li
                    key={task.id}
                    style={{
                      fontSize: "12px",
                      marginBottom: "4px",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "6px",
                      color: "#e5e7eb",
                    }}
                  >
                    <span>{task.title}</span>
                    <span style={{ color: "#bae6fd" }}>
                      {getDueLabel(task.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Input section */}
          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Task title (e.g., Finish DBMS assignment)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />
            <input
              type="text"
              placeholder="Subject / Course (optional)"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  flex: 1,
                  minWidth: "120px",
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  flex: 1,
                  minWidth: "120px",
                }}
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p} priority
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                style={{
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  flex: 1,
                  minWidth: "120px",
                }}
              />
            </div>

            <button
              onClick={handleAddTask}
              style={{
                marginTop: "4px",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                cursor: "pointer",
                alignSelf: "flex-end",
              }}
            >
              Add task
            </button>
          </div>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    border:
                      statusFilter === filter
                        ? "1px solid #2563eb"
                        : "1px solid #d1d5db",
                    background:
                      statusFilter === filter ? "#dbeafe" : "#ffffff",
                    color: "#111827",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                fontSize: "11px",
              }}
            >
              <option value="All">All categories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Task list with notes */}
          {filteredTasks.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#6b7280",
                marginTop: "16px",
              }}
            >
              No tasks to show for this filter.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {filteredTasks.map((task) => (
                <li
                  key={task.id}
                  style={{
                    marginBottom: "8px",
                    padding: "8px",
                    borderRadius: "6px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleComplete(task.id)}
                      style={{ marginTop: "4px" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                          color: task.completed ? "#6b7280" : "#111827",
                          fontWeight: 500,
                        }}
                      >
                        {task.title}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        Subject: {task.subject || "General"}
                      </div>
                      <div
                        style={{
                          marginTop: "4px",
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                          fontSize: "10px",
                        }}
                      >
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "999px",
                            color: "#ffffff",
                            background: getCategoryColor(task.category),
                          }}
                        >
                          {task.category}
                        </span>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "999px",
                            color: "#ffffff",
                            background: getPriorityColor(task.priority),
                          }}
                        >
                          {task.priority}
                        </span>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: "999px",
                            background: "#e5e7eb",
                            color: "#111827",
                          }}
                        >
                          {getDueLabel(task.dueDate)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{
                        border: "none",
                        background: "#ef4444",
                        color: "#ffffff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px",
                        marginLeft: "4px",
                      }}
                    >
                      Delete
                    </button>
                  </div>

                  {/* Notes area */}
                  <div style={{ marginTop: "6px" }}>
                    <label
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Add details (chapters, questions, links)..."
                      value={task.notes || ""}
                      onChange={(e) =>
                        handleUpdateNotes(task.id, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "6px",
                        borderRadius: "4px",
                        border: "1px solid #d1d5db",
                        fontSize: "12px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {tasks.some((t) => t.completed) && (
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button
                onClick={handleClearCompleted}
                style={{
                  border: "none",
                  background: "#6b7280",
                  color: "#ffffff",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Clear completed
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          width: "100%",
          padding: "8px 0",
          textAlign: "center",
          fontSize: "11px",
          color: "#9ca3af",
          borderTop: "1px solid #1e293b",
        }}
      >
        © {new Date().getFullYear()} Akash • Built with React
      </footer>
    </div>
  );
}

function getISODateOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default App;
