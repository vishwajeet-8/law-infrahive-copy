/* eslint-disable react/prop-types */
export default function Credit({ creditData }) {
  const extractUsername = (email) => {
    return email.split("@")[0];
  };

  const Badge = ({ children, variant = "default" }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        variant === "default"
          ? "bg-orange-100 text-orange-800" // Owner now uses orange
          : "bg-blue-100 text-blue-800" // Member now uses blue
      }`}
    >
      {children}
    </span>
  );

  return (
    <div className="py-6">
      {/* Usage History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Research Credit History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 pb-3">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold">Research Credit Usage</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              User activity breakdown
            </p>
          </div>
          <div className="px-6 pb-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {creditData?.research_credit?.history.reduce(
                  (sum, user) => sum + user.total_usage,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600">
                Total Research Credits Used
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {creditData?.research_credit?.history?.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          user.role === "Owner" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                      <span className="text-sm font-medium">
                        {extractUsername(user.email)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{user.total_usage}</div>
                    <div className="text-xs text-gray-500">credits used</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extraction Credit History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 pb-3">
            <div className="flex items-center space-x-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="text-lg font-semibold">Drafting Credits Usage</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Detailed usage by type and user
            </p>
          </div>
          <div className="px-6 pb-3">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">
                {creditData.extraction_credit.history
                  .reduce((sum, user) => sum + user.total_usage, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">
                Total Extraction Credits Used
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {creditData.extraction_credit.history.map((user, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          user.role === "Owner" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                      <span className="text-sm font-medium">
                        {extractUsername(user.email)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {user.total_usage.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">total credits</div>
                    </div>
                  </div>

                  {user.types && user.types.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                        Usage Types
                      </div>
                      {user.types.map((type, typeIndex) => (
                        <div
                          key={typeIndex}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">{type.type}</span>
                          <span className="font-medium">
                            {type.total_usage.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
