import React, { useState } from "react";
import { ChevronRight, Plus, X, Tag, Sparkles, FileText } from "lucide-react";

const TagInput = ({ onBack, onNext }) => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [agent, setAgent] = useState(""); // State for custom agent name

  const suggestedTags = [
    "agreement date",
    "parties involved",
    "address",
    "organization involved",
    "important dates",
    "amount",
    "partner capital contribution %",
    "amount contributed for all partners",
  ];

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag("");
      console.log("Current tags array:", updatedTags);
    }
  };

  const addSuggestedTag = (tag) => {
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      setTags(updatedTags);
      console.log("Current tags array after suggestion:", updatedTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
    console.log("Current tags array after removal:", updatedTags);
  };

  const getAllTags = () => {
    return tags;
  };

  // const handleNext = () => {
  //   const allTags = getAllTags();
  //   console.log("Final tags array:", allTags);
  //   console.log("Custom instructions:", customInstructions);
  //   console.log("Selected agent:", agent);
  //   onNext({
  //     tags: allTags,
  //     instructions: customInstructions,
  //     agent: agent.trim() || "Unassigned", // Use trimmed agent name or default to "Unassigned"
  //   });
  // };

  const handleNext = () => {
    const allTags = getAllTags();
    const trimmedAgent = agent.trim();
    if (!trimmedAgent) {
      alert("Please enter an agent name.");
      return;
    }
    if (trimmedAgent.length > 255) {
      alert("Agent name must be 255 characters or less.");
      return;
    }
    console.log("Final tags array:", allTags);
    console.log("Custom instructions:", customInstructions);
    console.log("Selected agent:", trimmedAgent);
    onNext({
      tags: allTags,
      instructions: customInstructions,
      agent: trimmedAgent || "Unassigned",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Configure Extraction
        </h2>
        <p className="text-gray-500">
          Define the information you want to extract from your documents
        </p>
      </div>

      {/* Agent Name Input */}
      {/* <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Agent Name</h3>
        </div>
        <input
          type="text"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          placeholder="Enter agent name (e.g., Legal Team, John Doe)"
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div> */}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Agent Name</h3>
        </div>
        <div className="relative">
          <input
            type="text"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            placeholder="Enter agent name (e.g., Legal Team, John Doe)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            maxLength={255} // Enforce max length
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {agent.length}/255
          </div>
        </div>
        {agent.length > 255 && (
          <p className="text-sm text-red-600">
            Agent name must be 255 characters or less.
          </p>
        )}
      </div>

      {/* Tag Input Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Tag className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">Add Custom Tags</h3>
        </div>

        <div className="relative">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(e);
              }
            }}
            placeholder="Enter a tag (e.g., contract value, signing date...)"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-16"
          />
          <button
            onClick={handleAddTag}
            disabled={!newTag.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Tags */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-medium text-gray-900">Suggested Tags</h3>
          <span className="text-sm text-gray-400">Click to add</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestedTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => addSuggestedTag(tag)}
              disabled={tags.includes(tag)}
              className={`p-3 text-left text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                tags.includes(tag)
                  ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex-1">{tag}</span>
                {!tags.includes(tag) && <Plus className="w-4 h-4 opacity-50" />}
                {tags.includes(tag) && (
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Added Tags */}
      {tags.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Selected Tags</h3>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {tags.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="group inline-flex items-center bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:bg-blue-100 hover:border-blue-300"
              >
                <span>{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 w-5 h-5 bg-blue-200 text-blue-600 rounded-full hover:bg-blue-300 hover:text-blue-800 transition-colors flex items-center justify-center group-hover:scale-110"
                  aria-label="Remove tag"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Instructions Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-medium text-gray-900">
            Custom Instructions
          </h3>
          <span className="text-sm text-gray-400">Optional</span>
        </div>

        <div className="relative">
          <textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="Provide additional context or specific instructions for extraction (e.g., 'Focus on monetary values in USD format', 'Extract dates in MM/DD/YYYY format', 'Look for signatures at the end of documents')..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
            rows={4}
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {customInstructions.length}/500
          </div>
        </div>

        {customInstructions.trim() && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <FileText className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-orange-800 mb-1">
                  Instructions Preview
                </p>
                <p className="text-sm text-orange-700">{customInstructions}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {tags.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Tag className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No tags added yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Add custom tags or select from suggestions above
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium"
        >
          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
          Back
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            {tags.length > 0
              ? `${tags.length} tag${tags.length !== 1 ? "s" : ""} selected`
              : "Select at least one tag to continue"}
          </span>
          {/* <button
            onClick={handleNext}
            disabled={tags.length === 0}
            className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              tags.length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            Start Extraction
            <ChevronRight className="w-4 h-4 ml-2" />
          </button> */}

          <button
            onClick={handleNext}
            disabled={tags.length === 0 || !agent.trim()}
            className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              tags.length === 0 || !agent.trim()
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            Start Extraction
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagInput;
