import { useState } from 'react'
import { ChatWindow } from './components/ChatWindow'
import { Sidebar } from './components/Sidebar'
import './App.css'

const CAMPS = [{ id: 1 }]

function App() {
    const [selectedCampId, setSelectedCampId] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="app-layout">
            <Sidebar
                camps={CAMPS}
                selectedCampId={selectedCampId}
                onSelectCamp={setSelectedCampId}
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(o => !o)}
            />
            <ChatWindow campId={selectedCampId} />
        </div>
    )
}

export default App
