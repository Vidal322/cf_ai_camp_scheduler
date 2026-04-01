import './ChatMessage.css'
import type { ChatMessage } from '../hooks/useChat'
import Markdown from 'react-markdown'

export function ChatMessage({ message }: { message: ChatMessage}) {
    return (
        <div className={`chat-message ${message.sender}`}>
            {message.sender === 'ai'
                ? <div className="markdown"><Markdown>{message.content}</Markdown></div>
                : <p>{message.content}</p>
            }
        </div>
    )
}