import { useEffect, useState } from 'react'
import './ScheduleTable.css'

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
    const [slots, setSlots] = useState<Slot[]>([])

    useEffect(() => {
        fetch(`${API_URL}/schedule?camp-id=${campId}`)
            .then(r => r.json<Slot[]>())
            .then(setSlots)
            .catch(e => console.error('Failed to load schedule:', e))
    }, [campId])

    function getSlot(day: number, period: string) {
        return slots.find(s => s.day === day && s.period === period)
    }

    return (
        <div className="schedule-container">
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
