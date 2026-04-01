export async function deleteCamp(db: D1Database, id: number): Promise<void> {
    await db.prepare('DELETE FROM Camp WHERE id = ?').bind(id).run();
}

export async function getCamps(db: D1Database): Promise<{id: number, name: string}[]> {
    const result = await db.prepare('SELECT id, name FROM Camp ORDER BY id ASC').all();
    return result.results as {id: number, name: string}[];
}

export async function createCamp(
    db: D1Database,
    name: string,
    description: string,
    quantity: number,
    start_date: string,
    end_date: string
): Promise<number> {
    const result = await db.prepare(
        'INSERT INTO Camp (name, description, quantity, start_date, end_date) VALUES (?, ?, ?, ?, ?)'
    ).bind(name, description, quantity, start_date, end_date).run();

    return result.meta.last_row_id;
}


export async function createActivity(
    db: D1Database,
    name: string,
    category: 'sport' | 'cultural' | 'slow',
    is_indoor: 0 | 1,
    description: string
): Promise<number> {
    const result = await db.prepare(
        'INSERT INTO Activity (name, category, is_indoor, description) VALUES (?, ?, ?, ?)'
    ).bind(name, category, is_indoor, description).run();

    return result.meta.last_row_id;
}

export async function createSchedule(
    db: D1Database,
    camp_id: number
): Promise<number> {
    console.log('Creating schedule for camp_id', camp_id);
    const result = await db.prepare(
        'INSERT INTO Schedule (camp_id) VALUES (?)'
    ).bind(camp_id).run();

    return result.meta.last_row_id;
}

export async function assignSlot(
    db: D1Database,
    schedule_id: number,
    activity_id: number,
    room_id: number,
    day: number,
    period: 'morning' | 'afternoon'
): Promise<number> {
    const result = await db.prepare(
        'INSERT INTO ScheduleSlot (schedule_id, activity_id, room_id, day, period) VALUES (?, ?, ?, ?, ?)'
    ).bind(schedule_id, activity_id, room_id, day, period).run();

    return result.meta.last_row_id;
}

export async function getSchedules(db: D1Database, camp_id: number): Promise<{id: number}[]> {
    const result = await db.prepare('SELECT id FROM Schedule WHERE camp_id = ? ORDER BY id ASC').bind(camp_id).all();
    return result.results as {id: number}[];
}

export async function getSchedule(db: D1Database, schedule_id: number): Promise<object[]> {
    const result = await db.prepare(`
        SELECT ss.day, ss.period, a.name AS activity, a.category, r.name AS room, r.is_indoor
        FROM ScheduleSlot ss
        JOIN Activity a ON ss.activity_id = a.id
        JOIN Room r ON ss.room_id = r.id
        WHERE ss.schedule_id = ?
        ORDER BY ss.day, ss.period
    `).bind(schedule_id).all();
    return result.results;
}

export async function searchActivities(db: D1Database, query: string): Promise<object[]> {
    const result = await db.prepare('SELECT id, name, category, description FROM Activity WHERE name LIKE ?').bind(`%${query}%`).all();
    return result.results;
}

export async function searchRooms(db: D1Database, query: string): Promise<object[]> {
    const result = await db.prepare('SELECT id, name, capacity, description FROM Room WHERE name LIKE ? OR description LIKE ?').bind(`%${query}%`, `%${query}%`).all();
    return result.results;
}

export async function getActivities(db: D1Database): Promise<object[]> {
    const result = await db.prepare('SELECT id, name, category, is_indoor, description FROM Activity').all();
    return result.results;
}

export async function getRooms(db: D1Database): Promise<object[]> {
    const result = await db.prepare('SELECT id, name, capacity, is_indoor, description FROM Room').all();
    return result.results;
}

export async function createRoom(
    db: D1Database,
    name: string,
    capacity: number,
    is_indoor: 0 | 1,
    description: string
): Promise<number> {
    const result = await db.prepare(
        'INSERT INTO Room (name, capacity, is_indoor, description) VALUES (?, ?, ?, ?)'
    ).bind(name, capacity, is_indoor, description).run();

    return result.meta.last_row_id;
}