import { DurableObject} from 'cloudflare:workers'

type Env = {
    SESSION: DurableObjectNamespace
}

export class Session extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {

    super(ctx, env)

    }

    async fetch(request: Request): Promise<Response> {

        if (request.headers.get('Upgrade') === 'websocket') {
            return this.handleWebSocket(request);
        }
        // Handle other HTTP requests here
        return new Response('Invalid request', { status: 400 });
    }


    async handleWebSocket(request: Request): Promise<Response> {

        const  webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        this.ctx.acceptWebSocket(server);
     
        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string ) {

        ws.send(`[DO] message: ${message}`);

    }

    async webSocketClose(ws: WebSocket, code: number, reason: string) {
    
        ws.close(code,reason);

    }

    async sayHello(): Promise <string> {

        let result = this.ctx.storage.sql
            .exec('SELECT "Hello, World, from DO!" AS message')
            .one();


        return result.message as string;
    }
}