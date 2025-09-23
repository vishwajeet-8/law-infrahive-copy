import { useNavigate, useParams } from "react-router-dom";

export default function WorkspaceSelector({ workspaces, loading, error }) {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.value) {
      navigate(`/workspaces/${e.target.value}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading workspaces...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={workspaceId || ""}
        onChange={handleChange}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 min-w-48 shadow-sm"
      >
        <option value="" disabled>
          Select a workspace
        </option>
        {workspaces.map((ws) => (
          <option key={ws.id} value={ws.id} className="text-gray-900">
            {ws.name}
          </option>
        ))}
      </select>

      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
