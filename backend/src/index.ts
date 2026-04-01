import {Hono} from 'hono'
import {cors} from 'hono/cors'
import {Session} from './do/Session';

type Bindings = {
	SESSION: DurableObjectNamespace<Session>
	ALLOWED_ORIGIN: string
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

export default app;
export { Session } from './do/Session';

