import { useEffect, useState, useRef} from 'react'


export type ChatMessage = {
    id: number
    content: string
    sender: 'user' | 'ai'
}


export function useChat(url: string, campId: number, onToolResponse?: () => void) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [status, setStatus] = useState<'open' | 'closed' | 'error' | 'connecting'>('connecting')
    const wsRef = useRef<WebSocket | null>(null)
    const nextId = useRef(0)

    useEffect(function() {
        setMessages([])
        nextId.current = 0
        setStatus('connecting')

        let ws: WebSocket | null = null
        let cancelled = false

        const historyUrl = `${import.meta.env.VITE_API_URL}/history?camp-id=${campId}`
        fetch(historyUrl)
            .then(r => r.json<{sender: string, content: string}[]>())
            .then(history => {
                if (cancelled) return
                setMessages(history.map(m => ({
                    id: nextId.current++,
                    content: m.content,
                    sender: m.sender as 'user' | 'ai'
                })))

                ws = new WebSocket(url)
                wsRef.current = ws

                ws.onopen = function() { setStatus('open') }
                ws.onmessage = function(event) {
                    const message: ChatMessage = {
                        id: nextId.current++,
                        content: event.data,
                        sender: 'ai'
                    }
                    setMessages(prev => [...prev, message])
                    if (event.data.startsWith('[Tool Used:')) {
                        onToolResponse?.()
                    }
                }
                ws.onerror = function() { setStatus('error') }
                ws.onclose = function() { setStatus('closed') }
            })
            .catch(e => console.error('Failed to load history:', e))

        return function cleanup() {
            cancelled = true
            ws?.close()
        }
    }, [url, campId])

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
