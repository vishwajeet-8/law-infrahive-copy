import React, { useState } from "react";
import {
  Search,
  MessageSquare,
  FileText,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SAMPLE_CASES = [
  {
    id: "case-1",
    title: "M/S. INOX RENEWABLES LTD. vs JAYESH ELECTRICALS LTD.",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-04-13",
    description:
      "Arbitration dispute touching seat/venue and the impact on court jurisdiction.",
    summarySections: {
      relevance:
        "Highly Relevant. The judgment directly addresses arbitration, which is the primary focus of the user's query referencing SC cases in 2021 about arbitration. The case discusses the determination of the seat of arbitration and the exclusive jurisdiction of courts in relation to arbitration proceedings [Page 7, 8]. Specifically, it interprets Section 20 of the Arbitration and Conciliation Act, 1996, and relies on precedents such as *BSG SGS SOMA JV vs. NHPC Limited* [(2020) 4 SCC 234] to establish principles for determining jurisdiction in arbitration matters [Page 8, 9].",
      verdict:
        "The Supreme Court allowed the appeal, setting aside the High Court's judgment. The Court held that by mutual agreement, the parties shifted the venue/place of arbitration from Jaipur to Ahmedabad [Page 5]. Relying on *BGS SGS SOMA JV vs. NHPC Limited*, the Court concluded that the designation of the place of arbitration equates to an exclusive jurisdiction clause, vesting the courts at the seat with exclusive jurisdiction [Page 8]. Therefore, the courts in Ahmedabad, not Rajasthan, have jurisdiction over the arbitration proceedings [Page 8, 9].",
      fact: "M/S Inox Renewables Ltd. appealed against the Gujarat High Court's decision, which upheld the Commercial Court's order stating that courts in Jaipur had jurisdiction over a Section 34 petition [Page 1]. The dispute arose from a purchase order between Gujarat Fluorochemicals Ltd. (GFL) and Jayesh Electricals Ltd., which contained an arbitration clause with the venue initially set at Jaipur [Page 2, 3]. The arbitrator, however, passed an award in Ahmedabad [Page 3]. The key issue was whether the venue change to Ahmedabad conferred jurisdiction to Ahmedabad courts [Page 5].",
    },
  },
  {
    id: "case-2",
    title:
      "PUNATSANGCHHU I HYDROELECTRIC PROJECT AUTHORITY vs LARSEN AND TOUBRO LIMITED",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-02-22",
    description:
      "Arbitration-related issues within a large infrastructure contract context.",
    summary:
      "Illustrative summary: Clarifies contractual arbitration obligations and supervisory jurisdiction of courts.",
  },
  {
    id: "case-3",
    title:
      "GR GREEN LIFE ENERGY PVT. LTD. vs LEITWIND SHRIRAM MANUFACTURING PRIVATE LIMITED",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-02-22",
    description:
      "Dispute concerning arbitration clauses and enforcement in commercial agreements.",
    summary:
      "Illustrative summary: Reiterates enforceability of valid arbitration clauses and process discipline.",
  },
  {
    id: "case-4",
    title:
      "BHARAT SANCHAR NIGAM LIMITED vs M/S NORTEL NETWORKS INDIA PVT. LTD.",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-03-10",
    description:
      "Arbitration dispute involving public sector contracting and limitation aspects.",
    summary:
      "Illustrative summary: Addresses limitation and the route for reference to arbitration in PSU contracts.",
  },
  {
    id: "case-5",
    title: "BHAVEN CONSTRUCTION vs EXE ENGINEER SARDAR SAROVAR NARMADA NIGAM",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-01-06",
    description:
      "Focus on arbitral tribunal jurisdiction and scope of court interference.",
    summary:
      "Illustrative summary: Emphasizes minimal court interference and primacy of arbitral process.",
  },
  {
    id: "case-6",
    title: "JHARKHAND URJA VIKAS NIGAM LIMITED vs THE STATE OF RAJASTHAN",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-12-15",
    description:
      "Arbitration-related dispute involving a state utility; issues around contractual interpretation and arbitral recourse.",
    summary:
      "Illustrative summary: Clarifies contours of contractual obligations for public utilities in arbitration context.",
  },
  {
    id: "case-7",
    title: "ARCELOR MITTAL NIPPON STEEL INDIA LTD. vs ESSAR BULK TERMINAL LTD.",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-09-14",
    description:
      "Commercial arbitration concerning port/terminal operations and performance obligations.",
    summary:
      "Illustrative summary: Reinforces the sanctity of commercial bargains and arbitral enforcement.",
  },
  {
    id: "case-8",
    title:
      "PASL WIND SOLUTIONS PRIVATE LIMITED vs GE POWER CONVERSION INDIA PRIVATE LIMITED",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-04-20",
    description:
      "Cross-border arbitration aspects including enforceability of foreign awards and party nationality questions.",
    summary:
      "Illustrative summary: Addresses foreign-seated arbitration and enforcement within Indian legal framework.",
  },
  {
    id: "case-9",
    title: "CHINTELS INDIA LTD. vs BHAYANA BUILDERS PVT. LTD.",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-02-11",
    description:
      "Arbitration agreement interpretation in a real estate/commercial dispute.",
    summary:
      "Illustrative summary: Discusses applicability of arbitration clauses and maintainability of proceedings.",
  },
  {
    id: "case-10",
    title:
      "NATIONAL HIGHWAY AUTHORITY OF INDIA vs M/S PROGRESSIVE CONSTRUCTION LTD",
    caseType: "Civil Appeal",
    court: "Supreme Court",
    date: "2021-02-12",
    description:
      "Public infrastructure contract arbitration, time extensions, and claims adjudication.",
    summary:
      "Illustrative summary: Affirms structured claim evaluation within arbitral process for infrastructure contracts.",
  },
];

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/30 bg-white/70 backdrop-blur-xl shadow-[0_6px_30px_-12px_rgba(0,0,0,0.25)] ${className}`}
    >
      {children}
    </div>
  );
}

function CaseCard({ legalCase, onSummarize, onChat }) {
  return (
    <GlassCard className="p-4 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.3)] transition-shadow duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
            {legalCase.title}
          </h3>
          <div className="text-xs text-gray-500 mb-2 flex flex-wrap gap-3">
            {legalCase.caseType && <span>Case Type: {legalCase.caseType}</span>}
            <span>Court: {legalCase.court}</span>
            <span>Date: {legalCase.date}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {legalCase.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => onSummarize(legalCase)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow focus:outline-none focus:ring-4 focus:ring-blue-500/30"
        >
          <Sparkles size={16} /> Summarize this case
        </button>
        <button
          onClick={() => onChat(legalCase)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          <MessageSquare size={16} /> Chat with AI
        </button>
      </div>
    </GlassCard>
  );
}

function ChatModal({ open, onClose, legalCase }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);

  const getMappedAnswer = (question, c) => {
    const q = (question || "").trim().toLowerCase();
    const isInox = c?.id === "case-1";
    if (isInox) {
      if (q === "what was the core issue?")
        return "Core issue: whether shifting the place of arbitration from Jaipur to Ahmedabad amounted to designating the seat, thereby conferring exclusive jurisdiction on Ahmedabad courts.";
      if (q === "which court had jurisdiction and why?")
        return "Ahmedabad courts had exclusive jurisdiction because the agreed place of arbitration functions as the juridical seat, following BGS SGS SOMA JV v. NHPC.";
      if (q === "what was the final outcome?")
        return "The Supreme Court allowed the appeal, set aside the High Court's view, and affirmed Ahmedabad's exclusive supervisory jurisdiction.";
      if (q === "any practical takeaway for drafting clauses?")
        return "Specify the seat explicitly. If you change the place by agreement, that can be read as designating the seat (and courts) unless the clause clearly says otherwise.";
    }
    // Generic mapped Q&A
    if (q === "what were the key issues?")
      return "Key issues involved arbitration clause interpretation, procedural posture, and the court's supervisory role over the arbitral process.";
    if (q === "was there any guidance on jurisdiction/seat?")
      return "The Court reiterated that the designated seat typically determines supervisory jurisdiction unless the contract clearly indicates otherwise.";
    if (q === "what was the outcome?")
      return "Outcome: the Court clarified the contractual/arbitral position and directed the matter in line with the clause and governing law.";
    if (q === "any practical takeaway?")
      return "Draft with precision: identify the seat, supervisory courts, and process timelines to avoid later disputes.";
    // Default fallback for unexpected input
    return "(Demo) I can answer the mapped questions for this case. Try one of the provided prompts.";
  };

  React.useEffect(() => {
    if (open) {
      setMessages([
        {
          id: `a-welcome-${Date.now()}`,
          role: "assistant",
          content:
            "You can discuss this case with me. What would you like to know?",
        },
      ]);
      setIsResponding(false);
    }
  }, [open, legalCase?.id]);

  if (!open) return null;

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { id: `u-${Date.now()}`, role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsResponding(true);
    setTimeout(() => {
      const answer = getMappedAnswer(trimmed, legalCase);
      const reply = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: answer,
      };
      setMessages((prev) => [...prev, reply]);
      setIsResponding(false);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-3xl mx-4">
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60 bg-white/60">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                Chat: {legalCase?.title}
              </div>
              <div className="text-xs text-gray-500 truncate">
                Ask questions about facts, verdict, or implications.
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100/60 text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-[380px] overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="flex">
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-indigo-600 text-white ml-auto"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {isResponding && (
              <div className="flex">
                <div className="max-w-[85%] px-3 py-2 rounded-2xl text-sm bg-gray-100 text-gray-800">
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:120ms]"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse [animation-delay:240ms]"></span>
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 p-3 border-t border-gray-200/60 bg-white/60">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            />
            <button
              onClick={handleSend}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow"
            >
              Send
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function LegalAIResearchAgent() {
  const [query, setQuery] = useState("SC cases in 2021 about arbitration");
  const [selectedCase, setSelectedCase] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5; // UI-only; does not affect the rendered list
  const TOTAL_PAGES = 19; // Force pagination to 19 pages (UI only)

  const filterCases = (text) => {
    const q = text.trim().toLowerCase();
    if (!q) return SAMPLE_CASES;
    return SAMPLE_CASES.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  };

  const handleSearch = () => {
    if (isSearching) return;
    setHasSearched(true);
    setIsSearching(true);
    setSelectedCase(null);
    setResults([]);
    setUsedFallback(false);
    setTimeout(() => {
      const filtered = filterCases(query);
      const noMatches = filtered.length === 0;
      setUsedFallback(noMatches);
      setResults(noMatches ? SAMPLE_CASES : filtered);
      setIsSearching(false);
      setCurrentPage(1);
    }, 1200);
  };

  const handleSummarize = (legalCase) => {
    setIsSummarizing(true);
    setSelectedCase(null);
    const authoritative =
      SAMPLE_CASES.find((c) => c.id === legalCase.id) || legalCase;
    setTimeout(() => {
      setSelectedCase(authoritative);
      setIsSummarizing(false);
    }, 1200);
  };

  const handleChat = (legalCase) => {
    setSelectedCase(legalCase);
    setChatOpen(true);
  };

  return (
    <div className="px-6 py-6">
      {/* Search */}
      <div className="max-w-5xl">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search legal cases, e.g., SC cases in 2021 about arbitration"
            className="w-full pl-12 pr-36 py-4 rounded-2xl border-2 border-gray-200/70 bg-white/70 backdrop-blur-md focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-gray-900 placeholder:text-gray-400"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results + Summary */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Results */}
        <div className="lg:col-span-7 space-y-4">
          {hasSearched && !isSearching && usedFallback && (
            <GlassCard className="p-3">
              <div className="text-xs text-gray-700">
                No exact matches. Showing similar sample cases.
              </div>
            </GlassCard>
          )}
          {hasSearched && !isSearching && results.length > 0 && (
            <div className="text-xs text-gray-500 mb-1">
              Showing {results.length}–{results.length} of {results.length}{" "}
              results
            </div>
          )}

          {!hasSearched && (
            <GlassCard className="p-6">
              <div className="text-sm text-gray-700">
                Enter a query and click{" "}
                <span className="font-medium">Search</span> to view sample
                cases.
              </div>
            </GlassCard>
          )}

          {isSearching && (
            <>
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-4 animate-pulse">
                  <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
                  <div className="h-3 w-40 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-8 w-40 bg-gray-200 rounded-xl"></div>
                    <div className="h-8 w-36 bg-gray-200 rounded-xl"></div>
                  </div>
                </GlassCard>
              ))}
            </>
          )}

          {!isSearching &&
            results.map((c) => (
              <CaseCard
                key={c.id}
                legalCase={c}
                onSummarize={handleSummarize}
                onChat={handleChat}
              />
            ))}

          {/* Pagination - UI only */}
          {hasSearched && !isSearching && results.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-center gap-1 select-none">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border ${
                    currentPage === 1
                      ? "text-gray-400 border-gray-200 bg-white/60 cursor-not-allowed"
                      : "text-gray-700 border-gray-200 bg-white/80 hover:bg-white"
                  }`}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({
                  length: TOTAL_PAGES,
                }).map((_, i) => {
                  const pageNum = i + 1;
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 h-9 min-w-9 inline-flex items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white/80 text-gray-700 border-gray-200 hover:bg-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1))
                  }
                  className={`h-9 w-9 inline-flex items-center justify-center rounded-lg border ${
                    currentPage === TOTAL_PAGES
                      ? "text-gray-400 border-gray-200 bg-white/60 cursor-not-allowed"
                      : "text-gray-700 border-gray-200 bg-white/80 hover:bg-white"
                  }`}
                  disabled={currentPage === TOTAL_PAGES}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="text-indigo-600" size={18} />
              <div className="text-sm font-semibold text-gray-900">
                {selectedCase ? "Summary" : "No case selected"}
              </div>
            </div>
            {isSummarizing ? (
              <div className="animate-pulse">
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 w-40 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                  <div className="h-4 w-11/12 bg-gray-200 rounded"></div>
                  <div className="h-4 w-10/12 bg-gray-200 rounded"></div>
                  <div className="h-4 w-9/12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : selectedCase ? (
              <div>
                <div className="text-base font-semibold text-gray-900 mb-2">
                  {selectedCase.title}
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  Court: {selectedCase.court} · Date: {selectedCase.date}
                </div>

                {selectedCase.summarySections ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        Relevance
                      </div>
                      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {selectedCase.summarySections.relevance}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        Verdict
                      </div>
                      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {selectedCase.summarySections.verdict}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-1">
                        Fact
                      </div>
                      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {selectedCase.summarySections.fact}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedCase.summary}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                Select a case and click "Summarize this case" to view the
                summary here.
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        legalCase={selectedCase}
      />
    </div>
  );
}

export default LegalAIResearchAgent;
