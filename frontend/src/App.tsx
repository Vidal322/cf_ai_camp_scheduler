import { useState, useEffect, useCallback } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { Sidebar } from './components/Sidebar'
import './App.css'

export type Camp = { id: number, name: string }

const API_URL = import.meta.env.VITE_API_URL

function App() {
    const [camps, setCamps] = useState<Camp[]>([])
    const [selectedCampId, setSelectedCampId] = useState<number | null>(null)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const loadCamps = useCallback(async () => {
        const res = await fetch(`${API_URL}/camps`)
        const data = await res.json<Camp[]>()
        setCamps(data)
        if (data.length > 0 && selectedCampId === null) {
            setSelectedCampId(data[0].id)
        }
    }, [])

    useEffect(() => { loadCamps() }, [loadCamps])

    async function handleAddCamp(camp: Omit<Camp, 'id'> & { description: string, quantity: number, start_date: string, end_date: string }) {
        const res = await fetch(`${API_URL}/camps`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(camp)
        })
        const newCamp = await res.json<Camp>()
        setCamps(prev => [...prev, newCamp])
        setSelectedCampId(newCamp.id)
    }

    return (
        <div className="app-layout">
            <Sidebar
                camps={camps}
                selectedCampId={selectedCampId}
                onSelectCamp={setSelectedCampId}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(o => !o)}
                onAddCamp={handleAddCamp}
            />
            {selectedCampId !== null && <ChatWindow campId={selectedCampId} />}
        </div>
    )
}

export default App
