import { DurableObject} from 'cloudflare:workers'

type Env = {
    SESSION: DurableObjectNamespace
    AI: Ai
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

    async webSocketMessage(ws: WebSocket, message: string ) {

        const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: [ 
                {role: 'system', content: 'You are helping build a schedule for a summer camp'},
                {role: 'user', content: message as string}
            ]
        });
        const result = response as {response: string}

        ws.send(`response: ${result.response}`);

    }

    async webSocketClose(ws: WebSocket, code: number, reason: string) {
    
        ws.close(code,reason);

    }

}