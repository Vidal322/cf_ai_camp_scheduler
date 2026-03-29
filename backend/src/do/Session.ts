import { DurableObject} from 'cloudflare:workers';
import { createCamp } from '../db/camp';

type Env = {
    SESSION: DurableObjectNamespace
    AI: Ai
    D1Database: D1Database
}

export class Session extends DurableObject<Env> {
    constructor(ctx: DurableObjectState, env: Env) {

    super(ctx, env)

    }

    private readonly tools = [                                                                                                                                                                  
        {
            type: 'function',                                                                                                                                                                   
            function: {
                name: 'create_camp',
                description: 'Creates a new summer camp',                                                                                                                                       
                parameters: {
                    type: 'object',                                                                                                                                                             
                    properties: {
                        name: { type: 'string', description: 'Name of the camp' },
                        description: { type: 'string', description: 'Description of the camp' },                                                                                                
                        quantity: { type: 'number', description: 'Number of campers' },
                        start_date: { type: 'string', description: 'Start date YYYY-MM-DD' },                                                                                                   
                        end_date: { type: 'string', description: 'End date YYYY-MM-DD' }
                    },                                                                                                                                                                          
                    required: ['name', 'description', 'quantity', 'start_date', 'end_date']
                }                                                                                                                                                                               
            }       
        }
    ]         

    
    /**
     * Handles incoming requests
     * Websocket upgrade connections are handled by handleWebSocket()
     * otherwise it will return an error response
     * @param request 
     * @returns 
     */
    async fetch(request: Request): Promise<Response> {

        if (request.headers.get('Upgrade') === 'websocket') {
            return this.handleWebSocket(request);
        }
        // Handle other HTTP requests here
        return new Response('Invalid request', { status: 400 });
    }

    /**
     * Retrieves all Chat History from D1 associated with camp_id
     * @param campId 
     * @returns 
     */
    async retrieveChatHistory(campId: number) {
        
        const result = await this.env.D1Database.prepare('SELECT sender, content FROM ChatMessage WHERE camp_id = ? ORDER BY created_at ASC').bind(campId).all();
        return result.results as {sender: string, content: string}[];

    }
    /**
     *  Saves message with camp_id, sender and content into D1 Database
     * @param campId 
     * @param sender 
     * @param content 
     */
    async saveChatMessage(campId: number, sender: 'user' | 'ai', content: string) {

        this.env.D1Database.prepare('INSERT INTO ChatMessage (sender, camp_id, content) VALUES (?, ?, ?)').bind(sender, campId, content).run();
        
    }

    /**
     * Handles Websockets connections, accepts the connection and returns the client Websocket in the response
     * Extracts campId from the request URL and attaches it to the server Websocket for later use
     * @param request 
     * @returns 
     */
    async handleWebSocket(request: Request): Promise<Response> {

        const  webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);
        this.ctx.acceptWebSocket(server);

        const url = new URL(request.url);
        const campId = Number(url.searchParams.get('camp-id'));

        server.serializeAttachment({campId});

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }


    /**
     * Handles incoming Websocket messages
     * Stores the user message in D1 Database
     * Retrieves the chat history for the camp
     * Sends the message content + Chat History to LLama 3.3 AI API
     * Returns the response to the client
     * @param ws 
     * @param message 
     */
    async webSocketMessage(ws: WebSocket, message: string ) {

        const campID = ws.deserializeAttachment().campId;

        const contextMessages = await this.retrieveChatHistory(campID);
        await this.saveChatMessage(campID, 'user', message);
        const userMessage = {role: 'user', content: message};

        const messages = [
            {role: 'system', content: 'You are helping build a schedule for a summer camp'},
            ...contextMessages.map(m => ({role: m.sender, content: m.content})),
            userMessage
        ]


        const response = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
            messages: messages,
            tools: this.tools
        }) as {response: string, tool_calls?: any[]};

        if ('tool_calls' in response && response.tool_calls) {
            for (const toolCall of response.tool_calls) {
                if (toolCall.name === 'create_camp') {
                    const args = toolCall.arguments as {name: string, description: string, quantity: number, start_date: string, end_date: string};
                    const campId = await createCamp(this.env.D1Database, args.name, args.description, args.quantity, args.start_date, args.end_date);
                    
                    ws.send(JSON.stringify({ type: 'tool_result', tool: 'create_camp', campId }));                                                                                                  

                }
            }
        } else {

            await this.saveChatMessage(campID, 'ai', response.response);
            ws.send(`response: ${response.response}`);
        } 



    }

    /**
     * Closes the Websocket connection with the provided code and reason
     * @param ws 
     * @param code 
     * @param reason 
     */
    async webSocketClose(ws: WebSocket, code: number, reason: string) {
    
        ws.close(code,reason);

    }

}