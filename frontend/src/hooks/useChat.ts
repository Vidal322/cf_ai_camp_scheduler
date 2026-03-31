import { useEffect, useState, useRef} from 'react'


export type ChatMessage = {
    id: number
    content: string
    sender: 'user' | 'ai'
}


export function useChat(url: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [status, setStatus] = useState<'open' | 'closed' | 'error' | 'connecting'>('connecting')
    const wsRef = useRef<WebSocket | null>(null)
    const nextId = useRef(0)
    

  useEffect(function() {                                                                                                                                                                      
      const ws = new WebSocket(url)                                                                                                                                                           
                                                                                                                                                                                              
      ws.onopen = function() { setStatus('open') }                                                                                                                                            
      ws.onmessage = function(event) {  
        const message: ChatMessage = {
            id: nextId.current++,
            content: event.data,
            sender: 'ai'
        }
        setMessages(prev => [...prev, message]) 

    }                                                                                                           
      ws.onerror = function() { setStatus('error') }                                                                                                                                          
      ws.onclose = function() { setStatus('closed') }                                                                                                                                         
                                                                                                                                                                                              
      wsRef.current = ws                                                                                                                                                                      
                                                                                                                                                                                              
      return function cleanup() {                                                                                                                                                             
          ws.close()
      }                                                                                                                                                                                       
  }, [url])      

    function sendMessage(content: string) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message: ChatMessage = {
                id: nextId.current++,
                content,
                sender: 'user'
            }

            setMessages(prev => [...prev, message])
            wsRef.current.send(content)
        }
        else {
            console.error('WebSocket is not open. Unable to send message.')
        }
    }

    return { messages, status, sendMessage }
}