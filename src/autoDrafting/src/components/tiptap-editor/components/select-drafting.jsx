/* eslint-disable react/prop-types */
import api from "@/utils/api";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import {
  useNavigate,
  useResolvedPath,
  useSearchParams,
} from "react-router-dom";

const SelectDrafting = ({
  setEditorContent,
  setCurrentVariables,
  setDocumentTitle,
}) => {
  const navigate = useNavigate();
  const pathname = useResolvedPath().pathname;
  const [drafts, setDrafts] = React.useState([]);
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const draftId = searchParams.get("draftId");

  const addDraft = async (id) => {
    const res = await api.get(`/auto-draft/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const draft = res.data.autoDraft;
    setEditorContent(draft.content);
    setCurrentVariables(draft.variables);
    setDocumentTitle(draft.title);
  };
  const getNameFromEmail = (email) => {
    if (!email) return "Unknown";
    return email.split("@")[0];
  };

  React.useEffect(() => {
    const f = async () => {
      const res = await api.get(`/auto-drafts?folder=drafting`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setDrafts(res.data.autoDrafts);
    };
    f();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("draftId")]);

  return (
    <div>
      {/* Custom Select Component */}
      <div className="relative">
        {/* Select Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-gray-900">
              {draftId && drafts?.find((d) => d.id === Number(draftId))?.file
                ? drafts.find((d) => d.id === Number(draftId))?.file
                : "Choose from drafting"}
            </span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {drafts.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                No data found
              </div>
            ) : (
              drafts.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setIsOpen(!isOpen);
                    navigate(`${pathname}?draftId=${file.id}`);
                    addDraft(file.id);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">
                      {file.file}
                    </span>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">
                        {file.user_role}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(file.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="text-xs text-blue-600 font-medium">
                        {getNameFromEmail(file.user_email)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectDrafting;
