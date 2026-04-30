export const fetchTodos = async () => {
  const response = await fetch("https://dummyjson.com/todos");
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }
  return response.json();
};

export const updateTodo = async (id: number, completed: boolean) => {
  const response = await fetch(`https://dummyjson.com/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  });
  if (!response.ok) {
    throw new Error("Failed to update todo");
  }
  return response.json();
};
