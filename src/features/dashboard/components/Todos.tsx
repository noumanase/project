import { useTodosData } from "../hooks/useTodosData";
import { type Todo } from "../types/types";
import { Todo as TodoItem } from "./Todo";

export function Todos() {
  const { data, isFetching } = useTodosData();

  if (isFetching) {
    return <div>Loading todos...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
        Your Todos
      </h2>

      <ul className="space-y-2">
        {data.todos.map((todo: Todo) => (
          <TodoItem key={todo.id} {...todo} />
        ))}
      </ul>
    </div>
  );
}
