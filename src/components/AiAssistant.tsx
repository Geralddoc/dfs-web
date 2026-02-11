import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, MessageSquare } from "lucide-react"; // Assuming lucide-react is available or I'll use SVGs

interface AiAssistantProps {
    data: any[]; // Farmers or Processors
    type: "Farmer" | "AgroProcessor";
    onFilter: (filters: { district?: string[], commodities?: string[], search?: string }) => void;
}

export function AiAssistant({ data, type, onFilter }: AiAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "ai", text: string }[]>([
        { role: "ai", text: `Hi! I'm your ${type} Assistant. Ask me things like "Show me mango farmers in Bethel" or "How many processors have cocoa?"` }
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

        // 1. Check for "Count" intent
        if (lowerText.includes("how many") || lowerText.includes("count")) {
            // Check for Commodity
            const commodityMatch = data.flatMap(d => d.commodities).find(c => lowerText.includes(c.toLowerCase()));
            // Check for District
            const districtMatch = [...new Set(data.map(d => d.district))].find(d => lowerText.includes(d.toLowerCase()));

            let filtered = data;
            if (commodityMatch) {
                filtered = filtered.filter(d => d.commodities.some((c: string) => c.toLowerCase() === commodityMatch.toLowerCase()));
            }
            if (districtMatch) {
                filtered = filtered.filter(d => d.district?.toLowerCase() === districtMatch.toLowerCase());
            }

            response = `I found ${filtered.length} ${type.toLowerCase()}s`;
            if (commodityMatch) response += ` with ${commodityMatch}`;
            if (districtMatch) response += ` in ${districtMatch}`;
            response += ".";
        }
        // 2. Check for "Filter" intent (Show me...)
        else if (lowerText.includes("show") || lowerText.includes("find") || lowerText.includes("list") || lowerText.includes("search")) {
            // Check for Commodity
            const commodityMatch = [...new Set(data.flatMap(d => d.commodities))].find(c => lowerText.includes(c.toLowerCase()));
            // Check for District
            const districtMatch = [...new Set(data.map(d => d.district))].find(d => lowerText.includes(d.toLowerCase()));

            if (commodityMatch) {
                filters.commodities = [commodityMatch];
                response += `Filtering by ${commodityMatch}. `;
            }
            if (districtMatch) {
                filters.district = [districtMatch];
                response += `Filtering by ${districtMatch}. `;
            }

            if (!commodityMatch && !districtMatch) {
                response = "I couldn't identify a specific district or commodity. Try typing the exact name.";
            } else {
                onFilter(filters); // Apply filters
                response += `Found ${data.filter(d => {
                    let match = true;
                    if (commodityMatch) match = match && d.commodities.some((c: string) => c.toLowerCase() === commodityMatch.toLowerCase());
                    if (districtMatch) match = match && d.district?.toLowerCase() === districtMatch.toLowerCase();
                    return match;
                }).length} results.`;
            }
        }
        else {
            response = "I'm not sure I understand. Try asking 'How many...' or 'Show me...'";
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
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all z-50 ${isOpen ? "hidden" : "flex"}`}
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    <span className="font-bold hidden md:inline">Ask AI</span>
                </div>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-8 right-8 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-indigo-100 flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-200">
                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <h3 className="font-bold">AI Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4" ref={scrollRef}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none"}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
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
