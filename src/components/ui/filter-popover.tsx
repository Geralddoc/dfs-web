import { useState, useRef, useEffect } from "react";

interface FilterPopoverProps {
    title: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export function FilterPopover({ title, options, selected, onChange }: FilterPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleToggle = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative inline-block text-left" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex justify-center w-full rounded-md border shadow-sm px-4 py-2 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${selected.length > 0 ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
            >
                {title}
                {selected.length > 0 && (
                    <span className="ml-2 bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs">
                        {selected.length}
                    </span>
                )}
                <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            {isOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="p-2 border-b">
                        <input
                            type="text"
                            placeholder={`Search ${title}...`}
                            className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    className="px-4 py-2 text-sm text-slate-700 hover:bg-indigo-50 cursor-pointer flex items-center"
                                    onClick={() => handleToggle(option)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(option)}
                                        readOnly
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                                    />
                                    <span className="truncate">{option}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-slate-500 italic">No matches found</div>
                        )}
                    </div>
                    {selected.length > 0 && (
                        <div className="p-2 border-t text-center">
                            <button
                                className="text-xs text-red-600 hover:text-red-800 font-medium"
                                onClick={() => { onChange([]); setIsOpen(false); }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
