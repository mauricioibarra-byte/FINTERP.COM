"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, X, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function CopilotDrawer() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [messages, setMessages] = React.useState<{ role: 'user' | 'ai', content: string }[]>([
        { role: 'ai', content: "Hello! I'm FintERP Copilot. I can help you analyze financial data, draft invoices, or explain complex transactions. How can I assist you today?" }
    ])
    const [input, setInput] = React.useState("")
    const [isTyping, setIsTyping] = React.useState(false)

    const toggle = () => setIsOpen(!isOpen)

    const sendMessage = async () => {
        if (!input.trim()) return

        const userMsg = input
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setInput("")
        setIsTyping(true)

        // Mock AI Response Streaming
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'ai', content: "I'm analyzing your request... (This is a mock response, typically this would stream from Bedrock)" }])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <>
            {/* Floating Trigger Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <Button
                    onClick={toggle}
                    size="lg"
                    className={cn(
                        "rounded-full h-14 w-14 shadow-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all duration-300",
                        isOpen && "rotate-90 scale-0 opacity-0"
                    )}
                >
                    <Sparkles className="h-6 w-6 text-white" />
                </Button>
            </div>

            {/* Drawer Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggle}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="fixed top-0 right-0 h-full w-[400px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-violet-500" />
                                    <h2 className="font-semibold text-white">FintERP Copilot</h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={toggle} className="hover:bg-zinc-800 text-zinc-400">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", msg.role === 'ai' ? "bg-violet-600/20 text-violet-400" : "bg-zinc-800 text-zinc-400")}>
                                            {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className={cn("rounded-2xl p-3 text-sm max-w-[80%]", msg.role === 'ai' ? "bg-zinc-900 text-zinc-300 border border-zinc-800" : "bg-violet-600 text-white")}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0">
                                            <Bot size={16} />
                                        </div>
                                        <div className="bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-2xl p-3 text-sm">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                    className="flex gap-2"
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask anything about your finances..."
                                        className="bg-zinc-950 border-zinc-800 focus-visible:ring-violet-600"
                                    />
                                    <Button type="submit" size="icon" className="bg-violet-600 hover:bg-violet-700">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                                <p className="text-[10px] text-zinc-600 mt-2 text-center">
                                    AI can make mistakes. Verify important financial data.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
