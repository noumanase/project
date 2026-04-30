import { useSuspenseQuery, useMutation } from "@tanstack/react-query";
import { fetchTodos, updateTodo } from "../api/todosApi";
import { queryClient } from "@shared/lib";

export function useTodosData() {
  const { data, isFetching } = useSuspenseQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      updateTodo(id, completed),
    onSuccess: () => {
      // Revalidate the 'todos' query after successful update
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return { data, isFetching, updateMutation };
}
