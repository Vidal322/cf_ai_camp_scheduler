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
