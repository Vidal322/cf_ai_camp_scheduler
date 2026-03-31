import './App.css'
import { ChatMessage } from './components/ChatMessage'
import { useChat } from './hooks/useChat'

function App() {
  const { messages, status, sendMessage } = useChat(import.meta.env.VITE_WS_URL)

  console.log('Chat status:', status)
  console.log('Chat messages:', messages)
  return (
    <>
      <button className=''
        onClick={() => sendMessage('Hello, AI!')}
      >
        Send Message to AI
      </button>

      <p>                                                                                                                                                                                         
        Last Message: {messages.length > 0 ? messages[messages.length - 1].content : 'No messages yet'}
      </p>    
      <ChatMessage message={{ id: 0, content: 'Hello!', sender: 'user' }} />
      <ChatMessage message={{ id: 1, content: 'Feel free to send a message.', sender: 'ai' }} />
    </>
  )
}

export default App
