import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  LogOut,
  GripVertical,
  CalendarDays,
  Bug,
  Sparkles,
  CheckCircle2,
  Clock3,
  ListTodo,
  User,
  Pencil,
  Trash2,
  RotateCcw,
  ChevronDown,
} from "lucide-react";

const STORAGE_KEY = "tasks:v1";
const COUNTER_KEY = "tasks:counter:v1";
const TOKEN_KEY = "auth:token";

const COLUMNS = [
  { id: "backlog", title: "Backlog", icon: ListTodo, tone: "bg-slate-100 text-slate-700" },
  { id: "doing", title: "Em andamento", icon: Clock3, tone: "bg-blue-100 text-blue-700" },
  { id: "review", title: "Revisão", icon: Sparkles, tone: "bg-violet-100 text-violet-700" },
  { id: "done", title: "Concluído", icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
];

const TYPES = [
  { id: "tarefa", label: "Tarefa", icon: ListTodo, tone: "bg-sky-100 text-sky-700 ring-sky-200" },
  { id: "bug", label: "Bug", icon: Bug, tone: "bg-rose-100 text-rose-700 ring-rose-200" },
  { id: "melhoria", label: "Melhoria", icon: Sparkles, tone: "bg-violet-100 text-violet-700 ring-violet-200" },
];

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;

  const status = raw.status ?? (raw.done ? "done" : "backlog");
  const type = raw.type ?? "tarefa";
  const priority = raw.priority ?? "media";
  const labels = Array.isArray(raw.labels) ? raw.labels : [];
  const parsedPoints = Number(raw.points ?? 0);

  return {
    id: raw.id ?? uid(),
    key: raw.key ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    status: COLUMNS.some((column) => column.id === status) ? status : "backlog",
    type: TYPES.some((item) => item.id === type) ? type : "tarefa",
    priority: ["baixa", "media", "alta"].includes(priority) ? priority : "media",
    assignee: raw.assignee ?? "",
    labels,
    points: Number.isFinite(parsedPoints) ? parsedPoints : 0,
    dueDate: raw.dueDate ?? "",
    createdAt: raw.createdAt ?? Date.now(),
    updatedAt: raw.updatedAt ?? Date.now(),
  };
}

function nextTaskKey() {
  const current = Number(localStorage.getItem(COUNTER_KEY) || "0") || 0;
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return `F024-${next}`;
}

function labelsToString(labels) {
  if (!Array.isArray(labels)) return "";
  return labels.join(", ");
}

function stringToLabels(text) {
  return String(text || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function priorityMeta(priority) {
  switch (priority) {
    case "alta":
      return { label: "Alta", className: "bg-red-100 text-red-700 ring-red-200" };
    case "baixa":
      return { label: "Baixa", className: "bg-emerald-100 text-emerald-700 ring-emerald-200" };
    default:
      return { label: "Média", className: "bg-amber-100 text-amber-700 ring-amber-200" };
  }
}

function columnCardClass(status) {
  switch (status) {
    case "doing":
      return "border-l-blue-500";
    case "review":
      return "border-l-violet-500";
    case "done":
      return "border-l-emerald-500";
    default:
      return "border-l-slate-300";
  }
}

function typeMeta(type) {
  return TYPES.find((item) => item.id === type) ?? TYPES[0];
}

function statusMeta(status) {
  return COLUMNS.find((column) => column.id === status) ?? COLUMNS[0];
}

function Field({ label, children, hint }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint ? <span className="text-xs text-slate-400">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function SummaryCard({ title, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-2xl font-semibold text-slate-900">{value}</strong>
        <span className="text-xs text-slate-400">{hint}</span>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function TaskCard({ task, columnId, onEdit, onRemove, onMove, onDragStart, onDragEnd, draggingId }) {
  const type = typeMeta(task.type);
  const TypeIcon = type.icon;
  const priority = priorityMeta(task.priority);
  const status = statusMeta(task.status);
  const StatusIcon = status.icon;

  return (
    <article
      draggable
      onDragStart={(event) => onDragStart(event, task.id)}
      onDragEnd={onDragEnd}
      onDoubleClick={() => onEdit(task.id)}
      onKeyDown={(event) => event.key === "Enter" && onEdit(task.id)}
      tabIndex={0}
      role="button"
      aria-label={`Tarefa ${task.key ?? ""}: ${task.title}`}
      className={`group rounded-2xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${columnCardClass(task.status)} ${draggingId === task.id ? "opacity-60" : "opacity-100"}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <GripVertical className="h-4 w-4" />
          <span>{task.key ?? "—"}</span>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${priority.className}`}>
          {priority.label}
        </span>
      </div>

      <h3 className="text-sm font-semibold leading-6 text-slate-900">{task.title}</h3>

      {task.description ? <p className="mt-2 line-clamp-3 text-sm text-slate-600">{task.description}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ring-1 ${type.tone}`}>
          <TypeIcon className="h-3.5 w-3.5" />
          {type.label}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium ${status.tone}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.title}
        </span>
        {task.points ? <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{task.points} pts</span> : null}
        {task.dueDate ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            <CalendarDays className="h-3.5 w-3.5" />
            {task.dueDate}
          </span>
        ) : null}
        {task.assignee ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            <User className="h-3.5 w-3.5" />
            {task.assignee}
          </span>
        ) : null}
      </div>

      {task.labels?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.labels.slice(0, 6).map((label) => (
            <span key={label} className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={() => onEdit(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>

        <button
          type="button"
          onClick={() => onMove(task.id, columnId === "done" ? "backlog" : "done")}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {columnId === "done" ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          {columnId === "done" ? "Reabrir" : "Concluir"}
        </button>

        <button
          type="button"
          onClick={() => onRemove(task.id)}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </button>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const titleRef = useRef(null);

  const [tasks, setTasks] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = safeParse(raw, []);
    if (!Array.isArray(items)) return [];
    return items.map(normalizeTask).filter(Boolean);
  });

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [priorityFilter, setPriorityFilter] = useState("todas");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    status: "backlog",
    type: "tarefa",
    priority: "media",
    assignee: "",
    labelsText: "",
    points: 0,
    dueDate: "",
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const byStatus = Object.fromEntries(COLUMNS.map((column) => [column.id, 0]));
    for (const task of tasks) {
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
    }
    return { total, byStatus };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks.filter((task) => {
      if (typeFilter !== "todos" && task.type !== typeFilter) return false;
      if (priorityFilter !== "todas" && task.priority !== priorityFilter) return false;
      if (!normalizedQuery) return true;

      const haystack = `${task.key ?? ""} ${task.title} ${task.description} ${(task.labels || []).join(" ")} ${task.assignee}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [tasks, query, typeFilter, priorityFilter]);

  const byColumn = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map((column) => [column.id, []]));
    for (const task of filteredTasks) {
      grouped[task.status].push(task);
    }
    for (const columnId of Object.keys(grouped)) {
      grouped[columnId].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    }
    return grouped;
  }, [filteredTasks]);

  function resetDraft() {
    setDraft({
      title: "",
      description: "",
      status: "backlog",
      type: "tarefa",
      priority: "media",
      assignee: "",
      labelsText: "",
      points: 0,
      dueDate: "",
    });
  }

  function openNew() {
    setEditingId(null);
    resetDraft();
    setIsFormOpen(true);
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  function openEdit(id) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    setEditingId(id);
    setDraft({
      title: task.title ?? "",
      description: task.description ?? "",
      status: task.status ?? "backlog",
      type: task.type ?? "tarefa",
      priority: task.priority ?? "media",
      assignee: task.assignee ?? "",
      labelsText: labelsToString(task.labels),
      points: Number(task.points ?? 0) || 0,
      dueDate: task.dueDate ?? "",
    });
    setIsFormOpen(true);
    requestAnimationFrame(() => titleRef.current?.focus());
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  function onSubmit(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return;

    const patch = {
      title,
      description: draft.description.trim(),
      status: draft.status,
      type: draft.type,
      priority: draft.priority,
      assignee: draft.assignee.trim(),
      labels: stringToLabels(draft.labelsText),
      points: Math.max(0, Math.min(999, Number(draft.points) || 0)),
      dueDate: draft.dueDate || "",
      updatedAt: Date.now(),
    };

    if (editingId) {
      setTasks((previous) => previous.map((item) => (item.id === editingId ? { ...item, ...patch } : item)));
    } else {
      const newTask = normalizeTask({
        id: uid(),
        key: nextTaskKey(),
        ...patch,
        createdAt: Date.now(),
      });
      setTasks((previous) => [newTask, ...previous]);
    }

    closeForm();
  }

  function removeTask(id) {
    setTasks((previous) => previous.filter((item) => item.id !== id));
    if (editingId === id) closeForm();
  }

  function moveTask(id, status) {
    setTasks((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status, updatedAt: Date.now() } : item)),
    );
  }

  function onDragStart(event, id) {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  }

  function onDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
  }

  function onDropColumn(event, columnId) {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (id) moveTask(id, columnId);
    setDragOverCol(null);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 py-4 md:px-6 lg:px-8 lg:py-6">
        <header className="mb-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Workspace</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 md:text-3xl">Projetos / F024</h1>
              <p className="mt-1 text-sm text-slate-500">Painel de gereciamente de tarefas Kanban</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openNew}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Criar tarefa
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>

          <div className="grid gap-4 px-5 py-5 md:grid-cols-2 xl:grid-cols-5 lg:px-6">
            <SummaryCard title="Total de tarefas" value={stats.total} hint="Visão geral" />
            <SummaryCard title="Backlog" value={stats.byStatus.backlog ?? 0} hint="Planejamento" />
            <SummaryCard title="Em andamento" value={stats.byStatus.doing ?? 0} hint="Execução" />
            <SummaryCard title="Revisão" value={stats.byStatus.review ?? 0} hint="Validação" />
            <SummaryCard title="Concluído" value={stats.byStatus.done ?? 0} hint="Entrega" />
          </div>
        </header>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full xl:max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                type="text"
                placeholder="Pesquisar por título, descrição, código, label ou responsável"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FilterSelect value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="todos">Todos os tipos</option>
                {TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                <option value="todas">Todas as prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </FilterSelect>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-4" aria-label="Quadro Kanban de tarefas">
          {COLUMNS.map((column) => {
            const ColumnIcon = column.icon;
            return (
              <div
                key={column.id}
                className={`rounded-2xl border border-slate-200 bg-[#f8f9fb] shadow-sm transition ${dragOverCol === column.id ? "ring-2 ring-blue-400" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverCol(column.id);
                }}
                onDragLeave={() => setDragOverCol((current) => (current === column.id ? null : current))}
                onDrop={(event) => onDropColumn(event, column.id)}
              >
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${column.tone}`}>
                      <ColumnIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">{column.title}</h2>
                      <p className="text-xs text-slate-500">{byColumn[column.id]?.length ?? 0} tarefas</p>
                    </div>
                  </div>

                  {column.id === "backlog" ? (
                    <button
                      type="button"
                      onClick={openNew}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      + Tarefa
                    </button>
                  ) : null}
                </div>

                <div className="min-h-[420px] space-y-3 p-3">
                  {(byColumn[column.id] || []).map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columnId={column.id}
                      onEdit={openEdit}
                      onRemove={removeTask}
                      onMove={moveTask}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      draggingId={draggingId}
                    />
                  ))}

                  {(byColumn[column.id] || []).length === 0 ? (
                    <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/80 text-center">
                      <p className="px-4 text-sm text-slate-500">Arraste uma tarefa para esta coluna.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {isFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Tarefa</p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">{editingId ? "Editar tarefa" : "Criar tarefa"}</h3>
                  <p className="mt-1 text-sm text-slate-500">Preencha as informações da tarefa e organize o fluxo do quadro.</p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Fechar
                </button>
              </div>
            </div>

            <form className="flex max-h-[calc(100vh-3rem)] flex-col" onSubmit={onSubmit}>
              <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-5 sm:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)] sm:p-6">
                <div className="space-y-5">
                  <Field label="Resumo" hint="Obrigatório">
                    <input
                      ref={titleRef}
                      type="text"
                      value={draft.title}
                      onChange={(event) => setDraft((previous) => ({ ...previous, title: event.target.value }))}
                      placeholder="Ex.: Implementar login com JWT"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </Field>

                  <Field label="Descrição" hint="Detalhes da demanda">
                    <textarea
                      rows={10}
                      value={draft.description}
                      onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))}
                      placeholder="Descreva contexto, objetivo, critérios de aceite e observações."
                      className="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </Field>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <Field label="Status">
                    <FilterSelect
                      value={draft.status}
                      onChange={(event) => setDraft((previous) => ({ ...previous, status: event.target.value }))}
                    >
                      {COLUMNS.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))}
                    </FilterSelect>
                  </Field>

                  <Field label="Tipo">
                    <FilterSelect
                      value={draft.type}
                      onChange={(event) => setDraft((previous) => ({ ...previous, type: event.target.value }))}
                    >
                      {TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </FilterSelect>
                  </Field>

                  <Field label="Prioridade">
                    <FilterSelect
                      value={draft.priority}
                      onChange={(event) => setDraft((previous) => ({ ...previous, priority: event.target.value }))}
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Média</option>
                      <option value="baixa">Baixa</option>
                    </FilterSelect>
                  </Field>

                  <Field label="Pontos">
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={draft.points}
                      onChange={(event) => setDraft((previous) => ({ ...previous, points: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </Field>

                  <Field label="Responsável">
                    <input
                      type="text"
                      value={draft.assignee}
                      onChange={(event) => setDraft((previous) => ({ ...previous, assignee: event.target.value }))}
                      placeholder="Ex.: drake"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </Field>

                  <Field label="Prazo">
                    <input
                      type="date"
                      value={draft.dueDate}
                      onChange={(event) => setDraft((previous) => ({ ...previous, dueDate: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </Field>

                  <Field label="Labels" hint="Separadas por vírgula">
                    <input
                      type="text"
                      value={draft.labelsText}
                      onChange={(event) => setDraft((previous) => ({ ...previous, labelsText: event.target.value }))}
                      placeholder="frontend, auth, bug"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingId ? "Salvar alterações" : "Criar tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
