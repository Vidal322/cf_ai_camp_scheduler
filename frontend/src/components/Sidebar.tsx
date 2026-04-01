import { useState } from 'react'
import './Sidebar.css'
import type { Camp } from '../App'

type NewCampForm = { name: string, description: string, quantity: number, start_date: string, end_date: string }

type SidebarProps = {
    camps: Camp[]
    selectedCampId: number | null
    onSelectCamp: (id: number) => void
    isOpen: boolean
    onToggle: () => void
    onAddCamp: (camp: NewCampForm) => Promise<void>
}

const EMPTY_FORM: NewCampForm = { name: '', description: '', quantity: 0, start_date: '', end_date: '' }

export function Sidebar({ camps, selectedCampId, onSelectCamp, isOpen, onToggle, onAddCamp }: SidebarProps) {
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState<NewCampForm>(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        await onAddCamp(form)
        setForm(EMPTY_FORM)
        setShowForm(false)
        setSubmitting(false)
    }

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
                                {camp.name}
                            </button>
                        ))}
                    </div>

                    {showForm ? (
                        <form className="add-camp-form" onSubmit={handleSubmit}>
                            <input placeholder="Name" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                            <input placeholder="Description" required value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                            <input placeholder="Capacity" type="number" required min={1} value={form.quantity || ''} onChange={e => setForm(f => ({...f, quantity: Number(e.target.value)}))} />
                            <input type="date" required value={form.start_date} onChange={e => setForm(f => ({...f, start_date: e.target.value}))} />
                            <input type="date" required value={form.end_date} onChange={e => setForm(f => ({...f, end_date: e.target.value}))} />
                            <div className="add-camp-form-actions">
                                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" disabled={submitting}>Create</button>
                            </div>
                        </form>
                    ) : (
                        <button className="add-camp" onClick={() => setShowForm(true)}>
                            + Add camp
                        </button>
                    )}
                </>
            )}
        </div>
    )
}
