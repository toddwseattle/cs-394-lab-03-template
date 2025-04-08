// src/components/TodoList.test.tsx

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MockInstance, vi } from 'vitest';

import { TodoList } from '../components/todo-list.component';

// Mock fetch API
window.fetch = vi.fn();

describe('TodoList Component', () => {
  const mockTodos = [
    { id: 1, title: 'Todo 1', completed: false, userId: 1 },
    { id: 2, title: 'Todo 2', completed: true, userId: 1 },
    { id: 3, title: 'Todo 3', completed: false, userId: 1 },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (window.fetch as unknown as MockInstance).mockResolvedValue({
      ok: true,
      json: async () => mockTodos,
    });
  });

  it('renders loading state initially', () => {
    render(<TodoList onSelectTodo={() => {}} />);
    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
  });

  it('renders todos after successful fetch', async () => {
    render(<TodoList onSelectTodo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
      expect(screen.getByText('Todo 3')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    (window.fetch as unknown as MockInstance).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<TodoList onSelectTodo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText(/error loading todos/i)).toBeInTheDocument();
    });
  });

  it('filters todos when "Open" filter is clicked', async () => {
    render(<TodoList onSelectTodo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
    });

    // Click on the "Open" filter button
    fireEvent.click(screen.getByTestId('filter-open'));

    // Should show only incomplete todos
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
    expect(screen.queryByText('Todo 2')).not.toBeInTheDocument();
  });

  it('filters todos when "Completed" filter is clicked', async () => {
    render(<TodoList onSelectTodo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Todo 2')).toBeInTheDocument();
    });

    // Click on the "Completed" filter button
    fireEvent.click(screen.getByTestId('filter-completed'));

    // Should show only completed todos
    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Todo 3')).not.toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('returns to all todos when "All" filter is clicked', async () => {
    render(<TodoList onSelectTodo={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
    });

    // First filter to only completed
    fireEvent.click(screen.getByTestId('filter-completed'));
    expect(screen.queryByText('Todo 1')).not.toBeInTheDocument();

    // Then go back to all
    fireEvent.click(screen.getByTestId('filter-all'));

    // Should show all todos again
    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
    expect(screen.getByText('Todo 3')).toBeInTheDocument();
  });

  it('does not trigger additional fetch calls when filtering', async () => {
    render(<TodoList onSelectTodo={() => {}} />);

    // Wait for initial fetch to complete
    await waitFor(() => {
      expect(screen.getByText('Todo 1')).toBeInTheDocument();
    });

    // Verify fetch was called exactly once
    expect(window.fetch).toHaveBeenCalledTimes(1);

    // Click all filter buttons in sequence
    fireEvent.click(screen.getByTestId('filter-completed'));
    fireEvent.click(screen.getByTestId('filter-open'));
    fireEvent.click(screen.getByTestId('filter-all'));

    // Verify fetch was still only called once
    expect(window.fetch).toHaveBeenCalledTimes(1);
    expect(window.fetch).toHaveBeenCalledWith(
      'https://jsonplaceholder.typicode.com/todos',
    );
  });
});
