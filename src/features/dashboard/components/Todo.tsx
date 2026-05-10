import { type Todo } from "../types/types";

export function Todo(todo: Todo) {
  return (
    <li key={todo.id} className="p-4 bg-white rounded-sm shadow-sm">
      <div className="flex items-center justify-between">
        <span
          className={
            todo.completed ? "line-through text-gray-500" : "text-gray-900"
          }
        >
          {todo.todo}
        </span>
      </div>
    </li>
  );
}
