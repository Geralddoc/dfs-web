import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";

interface AiAssistantProps {
    data: any[]; // Farmers or Processors
    type: "Farmer" | "AgroProcessor";
    onFilter: (filters: { district?: string[], commodities?: string[], search?: string }) => void;
}

// Dialect mapping for Caribbean/Trinidad & Tobago terms
const DIALECT_MAP: Record<string, string[]> = {
    count: ["how many", "count", "wah de count", "how much", "tell me how many"],
    show: ["show", "find", "list", "search", "show meh", "find meh", "weh", "whey", "gimme", "gimme sum"],
};

// Fuzzy matching utility
function getLevenshteinDistance(a: string, b: string): number {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) tmp[i] = [i];
    for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            tmp[i][j] = Math.min(
                tmp[i - 1][j] + 1,
                tmp[i][j - 1] + 1,
                tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return tmp[a.length][b.length];
}

function findBestMatch(input: string, choices: string[], threshold = 2): string | null {
    if (!input) return null;
    let bestMatch: string | null = null;
    let minDistance = threshold + 1;

    for (const choice of choices) {
        // Direct match
        if (choice.toLowerCase().includes(input.toLowerCase())) return choice;

        // Fuzzy match
        const distance = getLevenshteinDistance(input.toLowerCase(), choice.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = choice;
        }
    }
    return bestMatch;
}

export function AiAssistant({ data, type, onFilter }: AiAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
        { role: "ai", text: `Hi! I'm your ${type} Assistant. Ask me things like "Wah de count for cocoa?" or "Find meh farmers in Bethel"` }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const processQuery = (text: string) => {
        const lowerText = text.toLowerCase();
        let response = "";
        const filters: { district?: string[], commodities?: string[], search?: string } = {};

        // 1. Identify Intent (using dialect mapping)
        const isCountIntent = DIALECT_MAP.count.some(phrase => lowerText.includes(phrase));
        const isShowIntent = DIALECT_MAP.show.some(phrase => lowerText.includes(phrase));

        const words = lowerText.split(/\s+/).filter(w => w.length > 2);

        // 2. Extract Entities with Fuzzy Matching
        const allDistricts = [...new Set(data.map(d => d.district).filter(Boolean))];
        const allCommodities = [...new Set(data.flatMap(d => d.commodities).filter(Boolean))];

        let matchedDistrict: string | null = null;
        let matchedCommodity: string | null = null;

        // Try to find matches in words
        for (const word of words) {
            if (!matchedDistrict) matchedDistrict = findBestMatch(word, allDistricts);
            if (!matchedCommodity) matchedCommodity = findBestMatch(word, allCommodities);
        }

        if (isCountIntent) {
            let filtered = data;
            if (matchedCommodity) {
                filtered = filtered.filter(d => d.commodities.some((c: string) => c.toLowerCase() === matchedCommodity?.toLowerCase()));
            }
            if (matchedDistrict) {
                filtered = filtered.filter(d => d.district?.toLowerCase() === matchedDistrict?.toLowerCase());
            }

            response = `I found ${filtered.length} ${type.toLowerCase()}s`;
            if (matchedCommodity) response += ` with ${matchedCommodity}`;
            if (matchedDistrict) response += ` in ${matchedDistrict}`;
            response += ".";
        }
        else if (isShowIntent) {
            if (matchedCommodity) {
                filters.commodities = [matchedCommodity];
                response += `Filtering by ${matchedCommodity}. `;
            }
            if (matchedDistrict) {
                filters.district = [matchedDistrict];
                response += `Filtering by ${matchedDistrict}. `;
            }

            if (!matchedCommodity && !matchedDistrict) {
                response = "I couldn't identify a specific district or commodity. Try asking gimme farmers by their location or crop.";
            } else {
                onFilter(filters);
                const count = data.filter(d => {
                    let match = true;
                    if (matchedCommodity) match = match && d.commodities.some((c: string) => c.toLowerCase() === matchedCommodity?.toLowerCase());
                    if (matchedDistrict) match = match && d.district?.toLowerCase() === matchedDistrict?.toLowerCase();
                    return match;
                }).length;
                response += `Found ${count} results.`;
            }
        }
        else {
            response = "I'm not sure I understand. Ask me 'Show meh cocoa' or 'Tell me how many farmers in Bethel'.";
        }

        setMessages(prev => [...prev, { role: "ai", text: response }]);
    };

    const handleSend = () => {
        if (!query.trim()) return;
        setMessages(prev => [...prev, { role: "user", text: query }]);
        processQuery(query);
        setQuery("");
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all z-50 ${isOpen ? "hidden" : "flex"}`}
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    <span className="font-bold hidden md:inline">Ask AI</span>
                </div>
            </button>

            {isOpen && (
                <div className="fixed bottom-8 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-200">
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <h3 className="font-bold">AI Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none"}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-white border-t border-slate-100">
                        <div className="flex gap-2">
                            <input
                                className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Ask something..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
