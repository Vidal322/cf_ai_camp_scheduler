import { useChat } from '../hooks/useChat'                                                                                                                                                  
import { ChatMessage } from './ChatMessage'                                                                                                                                                 
import { InputBar } from './InputBar'                                                                                                                                                       
import './ChatWindow.css'                                                                                                                                                                   
                                                                                                                                                                                            
export function ChatWindow() {                                                                                                                                                              
    const { messages, status, sendMessage } = useChat(import.meta.env.VITE_WS_URL)                                                                                                          
                                                                                                                                                                                            
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