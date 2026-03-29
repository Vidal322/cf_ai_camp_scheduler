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