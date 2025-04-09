// src/components/TodoList.tsx

import React, { useEffect, useState } from 'react';

import { Todo } from '../types/todo-type';

interface TodoListProps {
  onSelectTodo: (id: number) => void;
}

type FilterType = 'all' | 'open' | 'completed';

export const fetchTodos = async (setTodos, setFilteredTodos, setLoading, setError) => {
  try {
    setLoading(true);
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    setTodos(data);
    setFilteredTodos(data);
    setLoading(false);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An unknown error occurred');
    setLoading(false);
  }
};

export const TodoList: React.FC<TodoListProps> = ({ onSelectTodo }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos(setTodos, setFilteredTodos, setLoading, setError);
  }, []); // Empty dependency array means this effect runs only once on mount

  // Apply filter when either todos or activeFilter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredTodos(todos);
    } else if (activeFilter === 'open') {
      setFilteredTodos(todos.filter((todo) => !todo.completed));
    } else if (activeFilter === 'completed') {
      setFilteredTodos(todos.filter((todo) => todo.completed));
    }
  }, [todos, activeFilter]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return <div>Loading todos...</div>;
  }

  if (error) {
    return <div>Error loading todos: {error}</div>;
  }

  return (
    <div className="todo-list">
      <h2>Todo List</h2>
      <div className="filter-buttons">
        <button
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => handleFilterChange('all')}
          data-testid="filter-all"
        >
          All
        </button>
        <button
          className={activeFilter === 'open' ? 'active' : ''}
          onClick={() => handleFilterChange('open')}
          data-testid="filter-open"
        >
          Open
        </button>
        <button
          className={activeFilter === 'completed' ? 'active' : ''}
          onClick={() => handleFilterChange('completed')}
          data-testid="filter-completed"
        >
          Completed
        </button>
      </div>
      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <button
              className={`todo-button ${todo.completed ? 'completed' : ''}`}
              onClick={() => onSelectTodo(todo.id)}
              aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
            >
              <span>{todo.title}</span>
              <span>{todo.completed ? '✅' : '❌'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
