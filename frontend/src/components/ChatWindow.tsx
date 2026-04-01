import { useChat } from '../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { InputBar } from './InputBar'
import { useEffect, useRef, useState } from 'react'
import './ChatWindow.css'

export function ChatWindow({ campId, onToolResponse }: { campId: number, onToolResponse?: () => void }) {
    const wsUrl = `${import.meta.env.VITE_WS_URL}?camp-id=${campId}`
    const { messages, status, sendMessage } = useChat(wsUrl, campId, onToolResponse)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showScrollButton, setShowScrollButton] = useState(false)

    function scrollToBottom() {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }

    function handleScroll() {
        const el = scrollRef.current
        if (!el) return
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
        setShowScrollButton(!atBottom)
    }

    useEffect(() => {
        if (!showScrollButton) scrollToBottom()
    }, [messages])

    return (
        <div className='chat-window-container'>
            <div className='chat-window' ref={scrollRef} onScroll={handleScroll}>
                {messages.map(message => (
                    <ChatMessage key={message.id} message={message} />
                ))}
            </div>
            {showScrollButton && (
                <button className='scroll-to-bottom' onClick={scrollToBottom}>↓</button>
            )}
            <InputBar sendMessage={sendMessage} status={status} />
        </div>
    )
}
