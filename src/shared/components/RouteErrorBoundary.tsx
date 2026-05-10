import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const title = isRouteErrorResponse(error)
    ? String(error.status)
    : "Something went wrong";

  const message = isRouteErrorResponse(error)
    ? error.statusText || "Route request failed."
    : error instanceof Error
      ? error.message
      : "Unexpected error.";

  return (
    <div className="grid min-h-screen px-6 place-items-center">
      <div className="w-full max-w-md p-6 space-y-4 bg-white border rounded-xl">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-white rounded-sm bg-brand-600"
            onClick={() => navigate(-1)}
          >
            Go back
          </button>
          <button
            className="px-4 py-2 border rounded-sm"
            onClick={() => navigate("/dashboard")}
          >
            Go dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
