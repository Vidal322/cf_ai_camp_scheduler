import './Sidebar.css'

type Camp = { id: number }

type SidebarProps = {
    camps: Camp[]
    selectedCampId: number
    onSelectCamp: (id: number) => void
    isOpen: boolean
    onToggle: () => void
}

export function Sidebar({ camps, selectedCampId, onSelectCamp, isOpen, onToggle }: SidebarProps) {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button className="sidebar-toggle" onClick={onToggle}>
                {isOpen ? '‹' : '›'}
            </button>
            {isOpen && (
                <>
                    <div className="sidebar-camps">
                        {camps.map(camp => (
                            <button
                                key={camp.id}
                                className={`camp-item ${camp.id === selectedCampId ? 'active' : ''}`}
                                onClick={() => onSelectCamp(camp.id)}
                            >
                                Camp {camp.id}
                            </button>
                        ))}
                    </div>
                    <button className="add-camp" disabled>
                        + Add camp
                    </button>
                </>
            )}
        </div>
    )
}
