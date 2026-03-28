import {Hono} from 'hono'
import {Session} from './do/Session';

type Bindings = {
	SESSION: DurableObjectNamespace<Session>
}

const app = new Hono<{Bindings: Bindings}>()

app.get('/', (c) => {
  return c.text('Hello, World!')
})

app.get('/hello', async (c) => {
  const id = c.env.SESSION.idFromName('SESSION');
  const stub = c.env.SESSION.get(id);
  const message = await stub.sayHello();
  return c.text(message);
});

app.get('/ws', async (c) => {

		const id = c.env.SESSION.idFromName('SESSION');
		const stub = c.env.SESSION.get(id);
		const response = await stub.fetch(c.req.raw);

		return response;

	}

)

export default app;
export { Session } from './do/Session';

