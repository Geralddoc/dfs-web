"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShareDialog({ isOpen, onClose }: ShareDialogProps) {
    const [localIp, setLocalIp] = useState<string>("localhost");
    const [port, setPort] = useState<string>("3000");
    const [shareMode, setShareMode] = useState<"global" | "local">("global");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Fetch the local IP from our new API
            fetch("/api/ip")
                .then(res => res.json())
                .then(data => {
                    if (data.ip) setLocalIp(data.ip);
                })
                .catch(err => console.error("Failed to fetch local IP:", err));

            // Get port from window property if available
            if (typeof window !== "undefined") {
                setPort(window.location.port || "3000");
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const globalUrl = typeof window !== "undefined" ? `${window.location.origin}/viewer` : "";
    const viewerUrl = `http://${localIp}:${port}/viewer`;
    const activeUrl = shareMode === "global" ? globalUrl : viewerUrl;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeUrl)}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(activeUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                {/* Header */}
                <div className="bg-purple-600 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Share View-Only Access</h2>
                        <p className="text-purple-100 text-sm mt-1">Allow others to monitor data & analytics</p>
                    </div>
                    <button onClick={onClose} className="hover:bg-purple-700 p-2 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setShareMode("global")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shareMode === "global" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            WORLDWIDE WEB
                        </button>
                        <button
                            onClick={() => setShareMode("local")}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${shareMode === "local" ? "bg-white text-purple-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            HOME WI-FI
                        </button>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-200 shadow-inner">
                            <Image
                                src={qrCodeUrl}
                                alt="QR Code"
                                width={200}
                                height={200}
                                className="w-44 h-44 rounded-lg shadow-sm"
                                unoptimized
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-slate-600 font-medium">
                                {shareMode === "global"
                                    ? "Scan to view from anywhere in the world"
                                    : "Scan to view from another device on your Wi-Fi"}
                            </p>
                        </div>
                    </div>

                    {/* URL Section */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <input
                                type="text"
                                readOnly
                                value={activeUrl}
                                className="bg-transparent border-none text-[10px] text-slate-500 flex-1 outline-none font-mono"
                            />
                            <button
                                onClick={handleCopy}
                                className={`${copied ? "bg-emerald-500" : (shareMode === "global" ? "bg-indigo-600" : "bg-purple-600")} text-white px-4 py-1.5 rounded-md text-xs font-bold transition-all hover:scale-105 active:scale-95`}
                            >
                                {copied ? "COPIED!" : "COPY"}
                            </button>
                        </div>
                    </div>

                    {/* Context/Tips */}
                    {shareMode === "local" ? (
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h4 className="text-[10px] font-bold text-amber-800 flex items-center uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Wi-Fi Mode Tips
                            </h4>
                            <ul className="text-[10px] text-amber-700 mt-2 space-y-1 ml-4 list-disc">
                                <li>Ensure phone is on <span className="font-bold">Wi-Fi</span> (not mobile data).</li>
                                <li>Local IP detected: <span className="font-bold">{localIp}</span>.</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="text-[10px] font-bold text-indigo-800 flex items-center uppercase tracking-wider">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Global Mode Info
                            </h4>
                            <p className="text-[10px] text-indigo-700 mt-1">
                                This link works via the internet. Perfect for sharing with remote staff or partners.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-slate-800 font-bold text-sm px-4 py-2 transition-colors"
                    >
                        DONE
                    </button>
                </div>
            </div>
        </div>
    );
}
