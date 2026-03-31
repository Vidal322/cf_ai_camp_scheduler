import { useChat } from '../hooks/useChat'
import { ChatMessage } from './ChatMessage'
import { InputBar } from './InputBar'
import './ChatWindow.css'

export function ChatWindow({ campId }: { campId: number }) {
    const wsUrl = `${import.meta.env.VITE_WS_URL}?camp-id=${campId}`
    const { messages, status, sendMessage } = useChat(wsUrl)

    return (
        <div className='chat-window-container'>
            <div className='chat-window'>
                {messages.map(message => (
                    <ChatMessage key={message.id} message={message} />
                ))}
            </div>
            <InputBar sendMessage={sendMessage} status={status} />
        </div>
    )
}
