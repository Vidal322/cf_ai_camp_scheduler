import './App.css'
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
    </>
  )
}

export default App
