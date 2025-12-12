import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
}

function SortableTodoItem({ item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        className={`list-item ${item.status === STATUSES.DONE ? 'list-item--done' : ''}`}
      >
        {item.text}
      </div>
    </div>
  )
}

function KanbanColumn({ id, title, items }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      status: id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'kanban-column--over' : ''}`}
      data-column-id={id}
    >
      <h2 className="kanban-column-title">{title}</h2>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="kanban-column-content">
          {items.length === 0 ? (
            <div className="kanban-empty">No tasks</div>
          ) : (
            items.map((item) => (
              <SortableTodoItem key={item.id} item={item} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

function DeleteSection({ isOver }) {
  const { setNodeRef } = useDroppable({
    id: 'delete',
    data: {
      type: 'delete',
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`delete-section ${isOver ? 'delete-section--over' : ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </svg>
      <p className="delete-section-text">
        {isOver ? 'Drop to delete' : 'Drag here to delete'}
      </p>
    </div>
  )
}

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTodos()

    const channel = supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos' },
        () => {
          fetchTodos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchTodos() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Failed to fetch todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const dayLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
    })
    return formatter.format(new Date())
  }, [])

  async function addTodo(event) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ text: value, status: STATUSES.TODO }])
        .select()
        .single()

      if (error) throw error
      setTodos((current) => [...current, data])
      setText('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  async function updateTodoStatus(id, newStatus) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ status: newStatus })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTodos((current) =>
        current.map((item) => (item.id === id ? data : item))
      )
    } catch (error) {
      console.error('Failed to update todo status:', error)
    }
  }

  async function deleteTodo(id) {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)

      if (error) throw error
      setTodos((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const todosByStatus = useMemo(() => {
    const filtered = searchQuery.trim()
      ? todos.filter((todo) =>
          todo.text.toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      : todos

    return {
      [STATUSES.TODO]: filtered.filter((todo) => todo.status === STATUSES.TODO),
      [STATUSES.IN_PROGRESS]: filtered.filter(
        (todo) => todo.status === STATUSES.IN_PROGRESS
      ),
      [STATUSES.DONE]: filtered.filter((todo) => todo.status === STATUSES.DONE),
    }
  }, [todos, searchQuery])

  const [overDeleteSection, setOverDeleteSection] = useState(false)

  function handleDragStart(event) {
    setActiveId(event.active.id)
    setOverDeleteSection(false)
  }

  function handleDragOver(event) {
    const { over } = event
    if (over && over.data.current?.type === 'delete') {
      setOverDeleteSection(true)
    } else {
      setOverDeleteSection(false)
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveId(null)
    setOverDeleteSection(false)

    if (!over) return

    const activeId = active.id
    const activeTodo = todos.find((todo) => todo.id === activeId)
    if (!activeTodo) return

    // Check if dropped on delete section
    if (over.data.current?.type === 'delete') {
      deleteTodo(activeId)
      return
    }

    // Check if dropped on another todo item within the same column (reordering)
    const overTodo = todos.find((todo) => todo.id === over.id)
    if (overTodo && overTodo.status === activeTodo.status && activeId !== over.id) {
      // Reorder within the same column
      const columnItems = todosByStatus[activeTodo.status]
      const oldIndex = columnItems.findIndex((item) => item.id === activeId)
      const newIndex = columnItems.findIndex((item) => item.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(columnItems, oldIndex, newIndex)
        // Update the todos array maintaining the order
        const otherStatusItems = todos.filter(
          (todo) => todo.status !== activeTodo.status
        )
        setTodos([...otherStatusItems, ...reorderedItems])
      }
      return
    }

    let newStatus = activeTodo.status

    // Check if dropped on a column
    if (over.data.current?.type === 'column') {
      newStatus = over.data.current.status
    } else if (overTodo) {
      // Dropped on another todo item in a different column
      newStatus = overTodo.status
    }

    if (newStatus !== activeTodo.status) {
      updateTodoStatus(activeId, newStatus)
    }
  }

  const activeTodo = activeId ? todos.find((todo) => todo.id === activeId) : null

  return (
    <main className="page">
      <section className="notebook">
        <div className="top-bar">
          <p className="date">{dayLabel}</p>
        </div>
        <br />
        <div className="hero">
          <img
            src="/profile.jpg"
            alt="Profile"
            className="hero-image"
            loading="lazy"
          />
        </div>
        <form className="add-form" onSubmit={addTodo}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTodo(event)
              }
            }}
            placeholder="Add a task..."
            className="add-input"
            aria-label="Add a task"
          />
          <button type="submit" className="add-button">
            Add
        </button>
        </form>

        {loading ? (
          <div className="kanban-loading">Loading...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="kanban-board">
              <KanbanColumn
                id={STATUSES.TODO}
                title="To Do"
                items={todosByStatus[STATUSES.TODO]}
              />
              <KanbanColumn
                id={STATUSES.IN_PROGRESS}
                title="In Progress"
                items={todosByStatus[STATUSES.IN_PROGRESS]}
              />
              <KanbanColumn
                id={STATUSES.DONE}
                title="Done"
                items={todosByStatus[STATUSES.DONE]}
              />
            </div>
            <DeleteSection isOver={overDeleteSection} />
            <DragOverlay>
              {activeTodo ? (
                <div
                  className={`list-item ${activeTodo.status === STATUSES.DONE ? 'list-item--done' : ''}`}
                >
                  {activeTodo.text}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}

        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search tasks..."
            className="search-input"
            aria-label="Search tasks"
          />
      </div>
      </section>
    </main>
  )
}

export default App
