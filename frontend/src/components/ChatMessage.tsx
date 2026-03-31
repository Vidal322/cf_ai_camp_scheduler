import './ChatMessage.css'
import type { ChatMessage } from '../hooks/useChat'

export function ChatMessage({ message }: { message: ChatMessage}) {
    return (
        <div className={`chat-message ${message.sender}`}>
            <p>{message.content}</p>
        </div>
    )
}