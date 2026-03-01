import React, { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// --- SVG ICONS ---
// We need to define SVG icons directly since we can't use libraries in a single file.

const SparklesIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M12 3V.5m5.657 5.657L19.778 4.04M21.5 12H19m-5.657 5.657l-2.121 2.121M12 21.5V19m-5.657-5.657l-2.121-2.121M2.5 12H5m5.657-5.657L8.536 4.04"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const SettingsIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 01.57 1.73v.1a2 2 0 01-.57 1.73l-.15.1a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.38a2 2 0 00-.73-2.73l-.15-.1a2 2 0 01-.57-1.73v-.1a2 2 0 01.57-1.73l.15-.1a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle
            cx={12}
            cy={12}
            r={3}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const UserIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx={12} cy={7} r={4} />
    </svg>
)

const CommandIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3zM6 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3z" />
    </svg>
)

const MenuIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <line x1={3} y1={12} x2={21} y2={12} />
        <line x1={3} y1={6} x2={21} y2={6} />
        <line x1={3} y1={18} x2={21} y2={18} />
    </svg>
)

const XIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <line x1={18} y1={6} x2={6} y2={18} />
        <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
)

const SendIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <line x1={22} y1={2} x2={11} y2={13} />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
)

const MicIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        <path d="M19 10v2a7 7 0 01-14 0v-2" />
        <line x1={12} y1={19} x2={12} y2={23} />
    </svg>
)

const CalendarIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
        <line x1={16} y1={2} x2={16} y2={6} />
        <line x1={8} y1={2} x2={8} y2={6} />
        <line x1={3} y1={10} x2={21} y2={10} />
    </svg>
)

const MusicIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M9 18V5l12-2v13" />
        <circle cx={6} cy={18} r={3} />
        <circle cx={18} cy={16} r={3} />
    </svg>
)

const BotIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
        <path d="M17.5 11V8.5A5.5 5.5 0 0012 3a5.5 5.5 0 00-5.5 5.5V11" />
        <line
            x1={8}
            y1={16}
            x2={8.01}
            y2={16}
            strokeWidth={3}
            strokeLinecap="round"
        />
        <line
            x1={16}
            y1={16}
            x2={16.01}
            y2={16}
            strokeWidth={3}
            strokeLinecap="round"
        />
    </svg>
)

const CompassIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx={12} cy={12} r={10} />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
)

const PaletteIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <circle cx="13.5" cy="6.5" r="3.5" />
        <circle cx="17.5" cy="10.5" r="3.5" />
        <circle cx="8.5" cy="7.5" r="3.5" />
        <circle cx="6.5" cy="12.5" r="3.5" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.828-.13 2.684-.37" />
    </svg>
)

const HeartIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
)

const PlayIcon = (props) => (
    <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M8 5v14l11-7z" />
    </svg>
)

const SkipBackIcon = (props) => (
    <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
)

const SkipForwardIcon = (props) => (
    <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
)

const ChevronDownIcon = (props) => (
    <svg
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

// --- AGENT DATA ---
const AGENTS = {
    atlas: {
        id: "atlas",
        name: "Atlas",
        tagline: "The Architect",
        icon: (props) => <BotIcon {...props} />,
        gradient: "from-blue-500 to-indigo-600",
        color: "blue-500",
        glow: "shadow-[0_0_25px_theme(colors.blue.500/0.6)]",
    },
    muse: {
        id: "muse",
        name: "Muse",
        tagline: "The Empath",
        icon: (props) => <MusicIcon {...props} />,
        gradient: "from-purple-500 to-pink-500",
        color: "purple-500",
        glow: "shadow-[0_0_25px_theme(colors.purple.500/0.6)]",
    },
    pathfinder: {
        id: "pathfinder",
        name: "Pathfinder",
        tagline: "The Scout",
        icon: (props) => <CompassIcon {...props} />,
        gradient: "from-teal-500 to-cyan-500",
        color: "teal-500",
        glow: "shadow-[0_0_25px_theme(colors.teal.500/0.6)]",
    },
    prism: {
        id: "prism",
        name: "Prism",
        tagline: "The Curator",
        icon: (props) => <PaletteIcon {...props} />,
        gradient: "from-pink-500 via-red-500 to-yellow-500",
        color: "pink-500",
        glow: "shadow-[0_0_25px_theme(colors.pink.500/0.6)]",
    },
    aura: {
        id: "aura",
        name: "Aura",
        tagline: "The Nurturer",
        icon: (props) => <HeartIcon {...props} />,
        gradient: "from-green-500 to-emerald-500",
        color: "green-500",
        glow: "shadow-[0_0_25px_theme(colors.green.500/0.6)]",
    },
}

// --- GEMINI API INTEGRATION ---

// System prompts define the "personality" of each agent for the Gemini API
const SYSTEM_PROMPTS = {
    atlas: `You are Atlas, "The Architect," a world-class planner. You are formal, precise, and organized. Your goal is to help the user manage their calendar, tasks, and schedule. When they ask to schedule something, be proactive and ask for date, time, and duration. You can collaborate with other agents by stating [HANDOFF to agent_name: reason].`,
    muse: `You are Muse, "The Empath." You are warm, gentle, and emotionally intelligent. Your goal is to understand the user's mood and suggest music, content, or mindfulness exercises. Start by asking how they feel. You can suggest playlists or handoff to other agents.`,
    pathfinder: `You are Pathfinder, "The Scout." You are clear, concise, and data-driven. Your goal is to provide travel, logistics, and weather information efficiently. Use bullet points for clarity.`,
    prism: `You are Prism, "The Curator." You are stylish, confident, and a little sassy. Your goal is to analyze events, weather, and user preferences to suggest outfits and style advice. Be descriptive and fashion-forward.`,
    aura: `You are Aura, "The Nurturer." You are caring, positive, and supportive. Your goal is to help the user with their wellness, track habits, suggest workouts, and provide health tips.`,
}

// Mock data to initialize the chat
const MOCK_MESSAGES = {
    atlas: [
        {
            id: 1,
            role: "agent",
            agentId: "atlas",
            content:
                "Hello! As Atlas, I'm ready to organize your day. What can I schedule for you?",
        },
    ],
    muse: [
        {
            id: 1,
            role: "agent",
            agentId: "muse",
            content:
                "Hey there. How are you feeling right now? I can find the perfect soundtrack for your mood.",
        },
    ],
    pathfinder: [
        {
            id: 1,
            role: "agent",
            agentId: "pathfinder",
            content:
                "Pathfinder reporting. Where are we headed? I can check routes, flights, and weather.",
        },
    ],
    prism: [
        {
            id: 1,
            role: "agent",
            agentId: "prism",
            content:
                "Hello, darling. Prism here. Got a big event coming up or just not sure what to wear? I can help.",
        },
    ],
    aura: [
        {
            id: 1,
            role: "agent",
            agentId: "aura",
            content:
                "Hi! It's Aura. How are your wellness goals? Let's check in on your habits or plan a quick stretch.",
        },
    ],
}

/**
 * Calls the Gemini API with the current chat history and system prompt.
 * Includes exponential backoff for retries.
 */
async function callGeminiApi(userMessage, chatHistory, systemPrompt) {
    const apiKey = "" // API key is handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`

    // Format the history for the Gemini API
    const contents = chatHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
    }))

    // Add the new user message
    contents.push({
        role: "user",
        parts: [{ text: userMessage }],
    })

    const payload = {
        contents: contents,
        systemInstruction: {
            parts: [{ text: systemPrompt }],
        },
    }

    let response
    let retries = 0
    const maxRetries = 3

    while (retries < maxRetries) {
        try {
            response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const result = await response.json()
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                    return text
                } else {
                    throw new Error("Invalid API response structure")
                }
            } else {
                throw new Error(
                    `API request failed with status ${response.status}`
                )
            }
        } catch (error) {
            console.error(`API Error (Attempt ${retries + 1}):`, error.message)
            retries++
            if (retries >= maxRetries) {
                throw error
            }
            // Exponential backoff: 1s, 2s, 4s
            await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retries - 1) * 1000)
            )
        }
    }
}

// --- REUSABLE COMPONENTS ---

/**
 * A decorative glow component that follows the agent's theme
 */
const AgentGlow = ({ agentId, className }) => {
    const agent = AGENTS[agentId]
    if (!agent) return null

    return (
        <div
            className={`absolute -inset-2 -z-10 blur-3xl ${className}`}
            style={{
                backgroundImage: `linear-gradient(to right, ${
                    agent.gradient.split(" ")[1]
                }, ${agent.gradient.split(" ")[2]})`,
                opacity: 0.3,
            }}
        />
    )
}

/**
 * The left sidebar for navigation and agent selection
 */
const Sidebar = ({
    selectedAgentId,
    onSelectAgent,
    isMobileOpen,
    setMobileOpen,
}) => {
    // THIS IS THE FIX:
    // Removed the 'useAnimation' hook and the corresponding 'useEffect'
    // The animation is already handled by the 'animate' prop on motion.div below.

    const sidebarVariants = {
        open: {
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
        closed: {
            x: "-100%",
            transition: { type: "spring", stiffness: 300, damping: 30 },
        },
    }

    const backdropVariants = {
        open: { opacity: 1, pointerEvents: "auto" },
        closed: { opacity: 0, pointerEvents: "none" },
    }

    const SidebarContent = () => (
        <nav className="flex flex-col h-full w-72 bg-gray-900/80 backdrop-blur-xl border-r border-white/10 p-4 text-white">
            {/* Header */}
            <div className="flex items-center gap-3 p-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/0 rounded-lg border border-white/20 flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-accent text-2xl font-bold">OneNest</h1>
                <button
                    className="ml-auto md:hidden text-gray-400 hover:text-white"
                    onClick={() => setMobileOpen(false)}
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Agent Selector */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
                <h2 className="font-accent text-sm font-semibold text-gray-400 px-2 tracking-wider uppercase">
                    Agents
                </h2>
                {Object.values(AGENTS).map((agent) => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        isSelected={selectedAgentId === agent.id}
                        onClick={() => {
                            onSelectAgent(agent.id)
                            setMobileOpen(false)
                        }}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="mt-6 p-2 bg-black/30 rounded-lg">
                <button className="flex items-center w-full gap-3 text-left text-gray-300 hover:text-white transition-colors">
                    <UserIcon className="w-8 h-8 p-1.5 bg-gray-700 rounded-full" />
                    <div>
                        <div className="font-semibold">Demo User</div>
                        <div className="text-xs text-gray-400">
                            View Profile
                        </div>
                    </div>
                </button>
            </div>
        </nav>
    )

    return (
        <>
            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50 md:hidden"
                        variants={backdropVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>
            <motion.div
                className="fixed top-0 left-0 h-full z-50 md:hidden"
                variants={sidebarVariants}
                initial="closed"
                animate={isMobileOpen ? "open" : "closed"} // This line handles the animation
            >
                <SidebarContent />
            </motion.div>

            {/* Desktop Sidebar */}
            <div className="hidden md:block h-full shrink-0">
                <SidebarContent />
            </div>
        </>
    )
}

/**
 * A single agent card in the sidebar
 */
const AgentCard = ({ agent, isSelected, onClick }) => {
    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full p-3 rounded-xl border transition-all duration-300 ${
                isSelected
                    ? "bg-white/10 border-white/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
        >
            <div className="flex items-center gap-4">
                <div
                    className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${agent.gradient}`}
                >
                    <agent.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                    <h3 className="font-accent font-bold text-lg text-white">
                        {agent.name}
                    </h3>
                    <p className="text-xs text-gray-400">{agent.tagline}</p>
                </div>
            </div>
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        className={`absolute -inset-px rounded-xl -z-10 ${agent.glow}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.5 } }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    />
                )}
            </AnimatePresence>
        </motion.button>
    )
}

/**
 * The main chat view including header, messages, and input
 */
const ChatView = ({ agentId, messages, onSend, onMenuClick, isThinking }) => {
    const agent = AGENTS[agentId]
    const scrollRef = useRef(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isThinking])

    return (
        <div className="flex flex-col flex-1 h-full max-h-screen relative overflow-hidden">
            {/* Background Gradient */}
            <div
                className={`absolute top-0 left-0 w-full h-1/2 -z-10 opacity-20 blur-3xl bg-gradient-to-br ${agent.gradient} transition-all duration-500`}
            />

            {/* Header */}
            <header className="shrink-0 flex items-center justify-between p-4 md:p-6 backdrop-blur-xl bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <button
                        className="md:hidden text-gray-300 hover:text-white"
                        onClick={onMenuClick}
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <h2 className="font-accent text-2xl font-bold text-white">
                        {agent.name}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <CommandIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </motion.button>
                </div>
            </header>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
                <div className="max-w-4xl mx-auto space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))}
                    </AnimatePresence>
                    {isThinking && <TypingIndicator agent={agent} />}
                </div>
            </div>

            {/* Chat Input */}
            <div className="shrink-0">
                <ChatInput
                    agent={agent}
                    onSend={onSend}
                    isThinking={isThinking}
                />
            </div>
        </div>
    )
}

/**
 * A single message bubble
 */
const MessageBubble = ({ message }) => {
    const isUser = message.role === "user"
    const agent = isUser ? null : AGENTS[message.agentId]

    return (
        <motion.div
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            layout
        >
            {!isUser && (
                <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${agent.gradient}`}
                >
                    <agent.icon className="w-5 h-5 text-white" />
                </div>
            )}
            <div
                className={`w-auto max-w-3/4 md:max-w-[70%] p-4 text-base font-medium rounded-2xl ${
                    isUser
                        ? "bg-blue-600 text-white rounded-br-lg"
                        : "bg-white/10 border border-white/20 text-gray-200 rounded-bl-lg"
                }`}
            >
                <pre className="font-sans whitespace-pre-wrap">
                    {message.content}
                </pre>
            </div>
        </motion.div>
    )
}

/**
 * Typing indicator component
 */
const TypingIndicator = ({ agent }) => {
    const dotVariants = {
        initial: { y: 0 },
        animate: { y: -5, transition: { yoyo: Infinity, duration: 0.3 } },
    }

    return (
        <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br ${agent.gradient}`}
            >
                <agent.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 p-4 bg-white/10 border border-white/20 rounded-2xl rounded-bl-lg">
                <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                    variants={dotVariants}
                    animate="animate"
                    transition={{ ...dotVariants.animate.transition, delay: 0 }}
                />
                <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                    variants={dotVariants}
                    animate="animate"
                    transition={{
                        ...dotVariants.animate.transition,
                        delay: 0.1,
                    }}
                />
                <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                    variants={dotVariants}
                    animate="animate"
                    transition={{
                        ...dotVariants.animate.transition,
                        delay: 0.2,
                    }}
                />
            </div>
        </motion.div>
    )
}

/**
 * The text input area at the bottom
 */
const ChatInput = ({ agent, onSend, isThinking }) => {
    const [text, setText] = useState("")
    const textareaRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (text.trim() && !isThinking) {
            onSend(text)
            setText("")
        }
    }

    // Auto-resize textarea
    useLayoutEffect(() => {
        const el = textareaRef.current
        if (el) {
            el.style.height = "auto"
            // We explicitly set the height to 0 before setting it to scrollHeight
            // to ensure it shrinks when text is deleted.
            el.style.height = "0px"
            el.style.height = `${el.scrollHeight}px`
        }
    }, [text])

    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 md:p-6 backdrop-blur-xl bg-white/5 border-t border-white/10"
        >
            <div className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSubmit(e)
                            }
                        }}
                        placeholder={
                            isThinking
                                ? `${agent.name} is thinking...`
                                : `Message ${agent.name}...`
                        }
                        className="w-full max-h-36 p-3 pr-24 rounded-2xl bg-white/5 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 resize-none overflow-y-auto disabled:opacity-70"
                        style={{ ringColor: agent.color }}
                        disabled={isThinking}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 disabled:opacity-50"
                            disabled={isThinking}
                        >
                            <MicIcon className="w-5 h-5" />
                        </motion.button>
                        {agent.id === "atlas" && (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 disabled:opacity-50"
                                disabled={isThinking}
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </motion.button>
                        )}
                        {agent.id === "muse" && (
                            <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10 disabled:opacity-50"
                                disabled={isThinking}
                            >
                                <MusicIcon className="w-5 h-5" />
                            </motion.button>
                        )}
                    </div>
                </div>
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-white bg-gradient-to-br ${agent.gradient} transition-all duration-300 ${agent.glow} disabled:opacity-70`}
                    disabled={isThinking || !text.trim()}
                >
                    {isThinking ? (
                        <SparklesIcon className="w-5 h-5 animate-pulse" />
                    ) : (
                        <SendIcon className="w-5 h-5" />
                    )}
                </motion.button>
            </div>
        </form>
    )
}

/**
 * The right-side context panel (Calendar, Spotify, etc.)
 */
const RightPanel = ({ agentId }) => {
    const agent = AGENTS[agentId]

    return (
        <aside className="hidden lg:block w-[360px] h-full shrink-0 backdrop-blur-xl bg-white/5 border-l border-white/10 p-6 text-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={agentId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="h-full flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${agent.gradient}`}
                        >
                            <agent.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-accent font-bold text-xl">
                                {agent.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {agent.tagline}
                            </p>
                        </div>
                    </div>

                    {/* Dynamic Content */}
                    {agentId === "atlas" && <CalendarWidget />}
                    {agentId === "muse" && <SpotifyWidget />}
                    {agentId === "pathfinder" && (
                        <div className="text-center text-gray-400 mt-20 p-4 bg-black/30 rounded-lg border border-white/10">
                            <CompassIcon className="w-12 h-12 mx-auto mb-4" />
                            <h4 className="font-semibold mb-2">
                                Pathfinder Context
                            </h4>
                            <p className="text-sm">
                                Real-time weather and travel data would appear
                                here.
                            </p>
                            <button className="text-sm mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/50 hover:bg-teal-500/30">
                                <SparklesIcon className="w-4 h-4" /> Ask Gemini
                                for trip ideas
                            </button>
                        </div>
                    )}
                    {agentId === "prism" && (
                        <div className="text-center text-gray-400 mt-20 p-4 bg-black/30 rounded-lg border border-white/10">
                            <PaletteIcon className="w-12 h-12 mx-auto mb-4" />
                            <h4 className="font-semibold mb-2">
                                Prism Context
                            </h4>
                            <p className="text-sm">
                                Your style boards and outfit suggestions would
                                appear here.
                            </p>
                            <button className="text-sm mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/50 hover:bg-pink-500/30">
                                <SparklesIcon className="w-4 h-4" /> ✨ Ask
                                Gemini for outfit ideas
                            </button>
                        </div>
                    )}
                    {agentId === "aura" && (
                        <div className="text-center text-gray-400 mt-20 p-4 bg-black/30 rounded-lg border border-white/10">
                            <HeartIcon className="w-12 h-12 mx-auto mb-4" />
                            <h4 className="font-semibold mb-2">Aura Context</h4>
                            <p className="text-sm">
                                Your habit tracker and wellness stats would
                                appear here.
                            </p>
                            <button className="text-sm mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-green-500/20 text-green-200 border border-green-500/50 hover:bg-green-500/30">
                                <SparklesIcon className="w-4 h-4" /> ✨ Ask
                                Gemini for a 5-min workout
                            </button>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </aside>
    )
}

/**
 * Mock Calendar Widget for Atlas
 */
const CalendarWidget = () => (
    <div className="space-y-6">
        {/* Mini Month View */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">November 2025</h4>
                <div className="text-gray-400 text-xs">Today: 8th</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
                <div className="text-gray-600">26</div>
                <div className="text-gray-600">27</div>
                <div className="text-gray-600">28</div>
                <div className="text-gray-600">29</div>
                <div className="text-gray-600">30</div>
                <div className="text-gray-600">31</div>
                <div>1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                <div className="relative">
                    <span className="p-1 rounded-full">6</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></span>
                </div>
                <div>7</div>
                <div className="relative">
                    <span className="bg-blue-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center">
                        8
                    </span>
                </div>
                <div>9</div>
                <div>10</div>
                <div>11</div>
                <div>12</div>
                <div>13</div>
                <div>14</div>
                <div>15</div>
                <div>16</div>
                <div className="relative">
                    <span className="p-1 rounded-full">17</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full"></span>
                </div>
                <div>18</div>
                <div>19</div>
                <div>20</div>
                <div>21</div>
                <div>22</div>
            </div>
        </div>

        {/* Today's Schedule */}
        <div>
            <h4 className="font-semibold mb-3">Today's Schedule</h4>
            <div className="space-y-3">
                <div className="flex gap-3 p-3 rounded-lg bg-black/30 border-l-2 border-blue-500">
                    <div className="text-xs text-gray-300">10:00 AM</div>
                    <div className="flex-1">
                        <h5 className="font-medium text-sm">Design Review</h5>
                        <p className="text-xs text-gray-400">Zoom</p>
                    </div>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-black/30 border-l-2 border-gray-500 opacity-60">
                    <div className="text-xs text-gray-300">1:00 PM</div>
                    <div className="flex-1">
                        <h5 className="font-medium text-sm">Lunch with Team</h5>
                        <p className="text-xs text-gray-400">Main Cafeteria</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

/**
 * Mock Spotify Widget for Muse
 */
const SpotifyWidget = () => (
    <div className="space-y-6">
        <div className="p-4 rounded-xl bg-black/30 border border-white/10">
            <div className="flex items-center gap-4">
                <img
                    src="https://placehold.co/80x80/A855F7/FFFFFF?text=Muse"
                    alt="Album Art"
                    className="w-20 h-20 rounded-lg"
                    onError={(e) =>
                        (e.currentTarget.src =
                            "https://placehold.co/80x80/A855F7/FFFFFF?text=Muse")
                    }
                />
                <div className="flex-1">
                    <h4 className="font-semibold text-white">
                        Starlight Serenity
                    </h4>
                    <p className="text-sm text-gray-400">Muse</p>
                </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-white">
                <SkipBackIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                <PlayIcon className="w-10 h-10" />
                <SkipForwardIcon className="w-6 h-6 text-gray-400 hover:text-white" />
            </div>
        </div>

        {/* Mood Playlist Chips */}
        <div>
            <h4 className="font-semibold mb-3">Quick Playlists</h4>
            <div className="flex flex-wrap gap-2">
                <button className="text-sm flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/50 hover:bg-purple-500/30">
                    <SparklesIcon className="w-4 h-4" /> ✨ Ask Gemini for a
                    playlist
                </button>
                <button className="text-xs py-1.5 px-3 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/50 hover:bg-pink-500/30">
                    Energetic
                </button>
                <button className="text-xs py-1.5 px-3 rounded-full bg-gray-500/20 text-gray-200 border border-gray-500/50 hover:bg-gray-500/30">
                    Calm
                </button>
            </div>
        </div>
    </div>
)

// --- MAIN APP COMPONENT ---

export default function App() {
    const [selectedAgentId, setSelectedAgentId] = useState("atlas")
    const [messages, setMessages] = useState(MOCK_MESSAGES.atlas)
    const [isMobileOpen, setMobileOpen] = useState(false)
    const [isThinking, setIsThinking] = useState(false)
    const chatHistories = useRef({
        atlas: MOCK_MESSAGES.atlas,
        muse: MOCK_MESSAGES.muse,
        pathfinder: MOCK_MESSAGES.pathfinder,
        prism: MOCK_MESSAGES.prism,
        aura: MOCK_MESSAGES.aura,
    })

    useEffect(() => {
        // Load chat history when agent changes
        setMessages(chatHistories.current[selectedAgentId] || [])
    }, [selectedAgentId])

    const handleSend = async (content) => {
        const userMessage = {
            id: Date.now(),
            role: "user",
            content,
        }

        // Optimistically update the UI with the user's message
        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        chatHistories.current[selectedAgentId] = newMessages
        setIsThinking(true)

        try {
            // Call the Gemini API
            const systemPrompt = SYSTEM_PROMPTS[selectedAgentId]
            const agentResponseContent = await callGeminiApi(
                content,
                newMessages,
                systemPrompt
            )

            const agentResponseMessage = {
                id: Date.now() + 1,
                role: "agent",
                agentId: selectedAgentId,
                content: agentResponseContent,
            }

            // Update state with the agent's response
            setMessages((prev) => [...prev, agentResponseMessage])
            chatHistories.current[selectedAgentId] = [
                ...newMessages,
                agentResponseMessage,
            ]
        } catch (error) {
            console.error("Failed to get Gemini response:", error)
            const errorMessage = {
                id: Date.now() + 1,
                role: "agent",
                agentId: selectedAgentId,
                content:
                    "Sorry, I'm having trouble connecting right now. Please try again later.",
            }
            setMessages((prev) => [...prev, errorMessage])
            chatHistories.current[selectedAgentId] = [
                ...newMessages,
                errorMessage,
            ]
        } finally {
            setIsThinking(false)
        }
    }

    return (
        <main className="flex h-screen w-full bg-gray-950 overflow-hidden font-sans">
            {/* Background Image */}
            <div className="fixed inset-0 -z-20">
                <img
                    src="https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=3600"
                    alt="Nebula background"
                    className="w-full h-full object-cover opacity-30"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                />
            </div>

            {/* Noise Overlay */}
            <div
                className="fixed inset-0 w-full h-full opacity-[0.03] -z-10"
                style={{
                    backgroundImage:
                        "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnMM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjk0N0U4QUU3QzFEMTExRTY5Q0EwRDM0MkI5QzZFRDdCIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjk0N0U4QUU4QzFEMTExRTY5Q0EwRDM0MkI5QzZFRDdCIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTQ3RThBRTVDMUQxMTFFNjlDQTNEMzQyQjlDNkVEN0IiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6OTQ3RThBRTZDMUQxMTFFNjlDQTNEMzQyQjlDNkVEN0IiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6nI81+AAABdElEQVR42uzRMQ7DIAwA0Nv7H8xERHQREbE5cQ0d3UNDh3ARwTjB09/ePY8zZ+f850PO8/A+v4h3x4eXJ5+fnp7+fn58fnx+fHx+fHx+fHx+fHx+fHx+fHx+fnx+fPz49Pb09PX29fX19vX19vb19fX29fX29vb19fX29vb19fX29vb19fX29vX19vb19fX29vb19fX29vb19fX29vb19fX29vb19fX29vb19fX2Bvb19vb19fX29vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb19vb1AdjustwAAAABJRU5ErkJggg==)",
                }}
            />

            <Sidebar
                selectedAgentId={selectedAgentId}
                onSelectAgent={setSelectedAgentId}
                isMobileOpen={isMobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="flex-1 flex min-w-0">
                <ChatView
                    agentId={selectedAgentId}
                    messages={messages}
                    onSend={handleSend}
                    onMenuClick={() => setMobileOpen(true)}
                    isThinking={isThinking}
                />
                <RightPanel agentId={selectedAgentId} />
            </div>
        </main>
    )
}
