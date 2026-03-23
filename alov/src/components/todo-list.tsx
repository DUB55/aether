"use client"

import React, { useState } from 'react'
import { CheckCircle2, Circle, Plus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

interface TodoListProps {
  todos: Todo[]
  onAddTodo: (text: string) => void
  onToggleTodo: (id: string) => void
  onDeleteTodo: (id: string) => void
  className?: string
}

export function TodoList({ todos, onAddTodo, onToggleTodo, onDeleteTodo, className }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim())
      setNewTodo('')
      setIsAdding(false)
    }
  }

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-sm font-bold text-foreground">Tasks</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {completedCount} of {totalCount} completed
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsAdding(true)}
          className="h-8 w-8 p-0 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Add New Todo */}
        {isAdding && (
          <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/30">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') {
                  setIsAdding(false)
                  setNewTodo('')
                }
              }}
              placeholder="Add a task..."
              className="flex-1 bg-transparent border-none text-xs outline-none placeholder:text-muted-foreground/50"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAdd}
              className="h-6 w-6 p-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAdding(false)
                setNewTodo('')
              }}
              className="h-6 w-6 p-0"
            >
              <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            </Button>
          </div>
        )}

        {/* Existing Todos */}
        {todos.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Circle className="w-12 h-12 text-muted-foreground/20 mb-3" />
            <p className="text-xs text-muted-foreground">No tasks yet</p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">Click + to add your first task</p>
          </div>
        )}

        {todos.map((todo) => (
          <div
            key={todo.id}
            className={cn(
              "group flex items-center gap-2 p-2 rounded-lg border transition-all",
              todo.completed
                ? "border-border/50 bg-muted/20"
                : "border-border bg-background hover:bg-muted/30"
            )}
          >
            <button
              onClick={() => onToggleTodo(todo.id)}
              className="flex-shrink-0 transition-all"
            >
              {todo.completed ? (
                <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              )}
            </button>
            <span
              className={cn(
                "flex-1 text-xs transition-all",
                todo.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {todo.text}
            </span>
            <button
              onClick={() => onDeleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="p-4 border-t border-border">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-white transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
