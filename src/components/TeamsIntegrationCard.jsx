import React, { useState } from "react";

function Copyable({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group flex items-center gap-2 rounded-xl border bg-gray-100 px-3 py-2">
      <code className="text-sm font-mono break-all">{text}</code>
      <button
        className="ml-auto p-1 rounded hover:bg-gray-200 text-xs"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {}
        }}
      >
        📋
      </button>
      <span className="text-xs text-gray-500 opacity-0 transition-opacity group-hover:opacity-100">
        {copied ? "Copied!" : "Copy"}
      </span>
    </div>
  );
}

// --- Commands Data ---
const COMMANDS = [
  {
    name: "/search",
    usage: "/search <filename>",
    description: "search for filename, keyword search not exact match",
    category: "Files",
  },
  {
    name: "/list",
    usage: "/list",
    description: "list all the files in Infrahve workspace",
    category: "Files",
  },

  {
    name: "/get",
    usage: "/get <file_name>",
    description: "fetches file from infrahive database",
    category: "Files",
  },
  {
    name: "/teamfiles",
    usage: "/teamfiles <team name>",
    description: "list of files for a particular team",
    category: "Files",
  },

  {
    name: "/channelfiles",
    usage: "/channelfiles <channelname>",
    description: "list of files for a particular channel",
    category: "Files",
  },

  {
    name: "/teams",
    usage: "/teams",
    description: "list all the available teams",
    category: "Teams",
  },
  {
    name: "/channels",
    usage: "/channels <team name>",
    description: "list all the channels in a team",
    category: "Channels",
  },
];

export default function TeamsIntegrationCard() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("setup");

  return (
    <div className="my-10 max-w-md bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
      {/* --- Card --- */}
      <div className="p-8">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-12 w-12"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg/1200px-Microsoft_Office_Teams_%282018%E2%80%93present%29.svg.png"
              alt="Microsoft Teams logo"
            />
          </div>
          <div className="ml-4">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              InfraHive AI Assistant
            </div>
            <p className="mt-1 text-gray-500">Legal Assistant for MS Teams</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-600">
            InfraHive AI Assistant allows you to interact with the platform
            within MS Teams integration.
          </p>

          <div className="mt-6">
            <button
              onClick={() => setOpen(true)}
              className="w-full flex justify-center items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              How to integrate with MS Teams
            </button>
          </div>
        </div>
      </div>

      {/* --- Modal --- */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Background */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setOpen(false)}
          ></div>

          {/* Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  InfraHive Teams Bot Setup Guide
                </h2>
                <p className="text-sm text-gray-500">
                  Step-by-step guide to install, login, and use the bot.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 py-4">
              <div className="flex border-b mb-4">
                <button
                  onClick={() => setTab("setup")}
                  className={`px-4 py-2 text-sm font-medium ${
                    tab === "setup"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Setup
                </button>
                <button
                  onClick={() => setTab("commands")}
                  className={`ml-2 px-4 py-2 text-sm font-medium ${
                    tab === "commands"
                      ? "border-b-2 border-indigo-600 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Commands
                </button>
              </div>

              {/* Setup Tab */}
              {tab === "setup" && (
                <div className="space-y-6 text-sm text-gray-700">
                  <section>
                    <h3 className="font-semibold">1) Visit “Apps” Page tab</h3>
                    <p>Navigate to the Apps section in Microsoft Teams.</p>
                  </section>

                  <section>
                    <h3 className="font-semibold">
                      2) Add “InfraHive AI Assistant”
                    </h3>
                    <p>
                      Find the App under “Build for your organization” and click
                      “Add”.
                    </p>
                    <p>A window will pop up, again click “Add”.</p>
                    <p>
                      The bot will be added for personal usage. You can open the
                      chat with the bot or add it to a channel. You can also pin
                      it in the sidebar for quick access.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold">3) Login to the Service</h3>
                    <p>
                      For first-time usage, run{" "}
                      <code className="bg-gray-100 px-1 py-0.5 rounded">
                        /login
                      </code>{" "}
                      (or from the bot home page).
                    </p>
                    <section className="rounded-xl border p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                          Setup
                        </span>
                        <span className="font-mono font-semibold text-gray-800">
                          /login
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        For first-time usage, run the login command in the bot
                        chat (or from the bot home page). You will be prompted
                        to enter your InfraHive platform Email &amp; Password.
                        Once verified, you’ll be logged in and won’t need to
                        login manually again.
                      </p>
                      <p>
                        After logging in, you will be prompted to authenticate,
                        Simply click to authenticate and allow permissions.
                      </p>
                      <Copyable text="/login" />
                    </section>
                  </section>
                </div>
              )}

              {/* Commands Tab */}
              {tab === "commands" && (
                <div className="space-y-6 text-sm text-gray-700">
                  <section>
                    <h3 className="font-semibold mb-4">Available Commands</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {COMMANDS.map((cmd) => (
                        <div
                          key={cmd.name}
                          className="rounded-xl border p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                              {cmd.category}
                            </span>
                            <span className="font-mono font-semibold text-gray-800">
                              {cmd.name}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {cmd.description}
                          </p>
                          <Copyable text={cmd.usage} />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
