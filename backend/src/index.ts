import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {Session} from './do/Session';
import {getCamps, createCamp} from './db/index';

type Bindings = {
	SESSION: DurableObjectNamespace<Session>
	ALLOWED_ORIGIN: string
	D1Database: D1Database
}

const app = new Hono<{Bindings: Bindings}>()

app.use((c, next) => cors({ origin: c.env.ALLOWED_ORIGIN })(c, next))

app.get('/', (c) => {
  return c.text('Hello, World!')
})


app.get('/ws', async (c) => {
		const id = c.env.SESSION.idFromName('SESSION');
		const stub = c.env.SESSION.get(id);
		return stub.fetch(c.req.raw);
	}
)

app.get('/history', async (c) => {
		const id = c.env.SESSION.idFromName('SESSION');
		const stub = c.env.SESSION.get(id);
		return stub.fetch(c.req.raw);
	}
)

app.get('/camps', async (c) => {
	const camps = await getCamps(c.env.D1Database);
	return c.json(camps);
})

app.post('/camps', async (c) => {
	const body = await c.req.json<{name: string, description: string, quantity: number, start_date: string, end_date: string}>();
	const id = await createCamp(c.env.D1Database, body.name, body.description, body.quantity, body.start_date, body.end_date);
	return c.json({ id, name: body.name }, 201);
})

export default app;
export { Session } from './do/Session';

