import { useEffect, useState } from 'react'
import './ScheduleTable.css'

type Schedule = { id: number }

type Slot = {
    day: number
    period: string
    activity: string
    category: string
    room: string
    is_indoor: number
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PERIODS = ['morning', 'afternoon']
const API_URL = import.meta.env.VITE_API_URL

export function ScheduleTable({ campId }: { campId: number }) {
    const [schedules, setSchedules] = useState<Schedule[]>([])
    const [selectedId, setSelectedId] = useState<number | null>(null)
    const [slots, setSlots] = useState<Slot[]>([])

    useEffect(() => {
        setSchedules([])
        setSelectedId(null)
        setSlots([])
        fetch(`${API_URL}/schedules?camp-id=${campId}`)
            .then(r => r.json())
            .then(data => {
                setSchedules(data)
                if (data.length > 0) setSelectedId(data[0].id)
            })
            .catch(e => console.error('Failed to load schedules:', e))
    }, [campId])

    useEffect(() => {
        if (selectedId === null) return
        fetch(`${API_URL}/schedule?schedule-id=${selectedId}`)
            .then(r => r.json())
            .then(setSlots)
            .catch(e => console.error('Failed to load schedule:', e))
    }, [selectedId])

    function getSlot(day: number, period: string) {
        return slots.find(s => s.day === day && s.period === period)
    }

    if (schedules.length === 0) {
        return <div className="schedule-empty">No schedules yet. Ask the AI to create one.</div>
    }

    return (
        <div className="schedule-container">
            <div className="schedule-tabs">
                {schedules.map((s, i) => (
                    <button
                        key={s.id}
                        className={`schedule-tab ${s.id === selectedId ? 'active' : ''}`}
                        onClick={() => setSelectedId(s.id)}
                    >
                        Schedule {i + 1}
                    </button>
                ))}
            </div>
            <table className="schedule-table">
                <thead>
                    <tr>
                        <th></th>
                        {DAYS.map((d, i) => <th key={i}>{d}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {PERIODS.map(period => (
                        <tr key={period}>
                            <td className="period-label">{period.charAt(0).toUpperCase() + period.slice(1)}</td>
                            {DAYS.map((_, i) => {
                                const slot = getSlot(i + 1, period)
                                return (
                                    <td key={i} className={`schedule-cell ${slot ? 'filled' : 'empty'}`}>
                                        {slot && (
                                            <>
                                                <span className="slot-activity">{slot.activity}</span>
                                                <span className="slot-room">{slot.room}</span>
                                            </>
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
