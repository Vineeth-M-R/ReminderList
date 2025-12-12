import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { supabase } from './lib/supabase'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()

    // Subscribe to real-time changes
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
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
        .insert([{ text: value, done: false }])
        .select()
        .single()

      if (error) throw error
      setTodos((current) => [...current, data])
      setText('')
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  async function toggleTodo(id) {
    const todo = todos.find((item) => item.id === id)
    if (!todo) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ done: !todo.done })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setTodos((current) =>
        current.map((item) => (item.id === id ? data : item))
      )
    } catch (error) {
      console.error('Failed to toggle todo:', error)
    }
  }

  async function deleteTodo(id, event) {
    event.stopPropagation()

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id)

      if (error) throw error
      setTodos((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  return (
    <main className="page">
      <section className="notebook">
        <header className="heading">
          <p className="date">{dayLabel}</p>
          <p className="title">To-do</p>
        </header>

        <form className="add-form" onSubmit={addTodo}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Add a task..."
            className="add-input"
            aria-label="Add a task"
          />
          <button type="submit" className="add-button">
            Add
          </button>
        </form>

        <ul className="list">
          {loading ? (
            <li className="list-item">Loading...</li>
          ) : todos.length === 0 ? (
            <li className="list-item">No tasks yet. Add one above!</li>
          ) : (
            todos.map((item) => (
              <li key={item.id} className="list-item-container">
                <button
                  type="button"
                  onClick={() => toggleTodo(item.id)}
                  className={`list-item ${item.done ? 'list-item--done' : ''}`}
                >
                  {item.text}
                </button>
                <button
                  type="button"
                  onClick={(e) => deleteTodo(item.id, e)}
                  className="delete-button"
                  aria-label="Delete task"
                >
                  ×
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  )
}

export default App
