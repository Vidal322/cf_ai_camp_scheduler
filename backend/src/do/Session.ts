import { DurableObject} from 'cloudflare:workers';
import { AiTool, createTools } from './tools';

type Env = {
    SESSION: DurableObjectNamespace
    AI: Ai
    D1Database: D1Database
}

export class Session extends DurableObject<Env> {

    private readonly tools: Record<string, AiTool>;

    private readonly model = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
    private readonly actionKeywords = ['create', 'add', 'assign', 'assignslot', 'assign slot', 'make', 'build', 'new', 'there is', 'i have a', 'set up'];

    private readonly systemPrompt;
    constructor(ctx: DurableObjectState, env: Env) {

        super(ctx, env)
        this.tools = createTools(this.env.D1Database);
        this.systemPrompt =  
            `You are an assistant for building a schedule for summer camps.
            The user will provide you with information about the camp and you will
            respond with the schedule as accurately as possible. You have access to the following tools:
            ${Object.values(this.tools).map(t => `Tool Name: ${t.definition.function.name}, Description: ${t.definition.function.description}`).join('\n')}`;
    }


    
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


    private async buildMessages(campId: number, message: string) {
        const contextMessages = await this.retrieveChatHistory(campId);
        return [
            { role: 'system', content: this.systemPrompt },
            ...contextMessages.map(m => ({ role: m.sender, content: m.content })),
            { role: 'user', content: message }
        ];
    }
    /**
     * Runs the AI model with the provided messages
     * Checks if the user message contains action keywords to decide whether to allow tool calls
     * @param messages 
     * @param message 
     * @returns 
     */
    private async runAI(messages: any[], message: string) {
        const questionWords = ['can you', 'do you', 'what', 'how', 'why', 'would you'];
        const isQuestion = questionWords.some(q => message.toLowerCase().includes(q));
        const isAction = !isQuestion && this.actionKeywords.some(k => message.toLowerCase().includes(k));
        const response = await this.env.AI.run(this.model, {
            messages,
            tool_choice: isAction ? 'auto' : undefined,
            tools: isAction ? Object.values(this.tools).map(t => t.definition) : undefined
        }) as { response: string, tool_calls?: any[] };
        return response;                                                                                                                                             

    }

    /**
     * Handles tool calls from the AI model
     * For each tool call, it executes the corresponding tool handler and gets the result
     * It then sends a follow-up message to the AI with the tool result and gets the AI response
     * Finally, it saves the tool message and AI response in the chat history and sends them to the client
     * @param ws 
     * @param campId 
     * @param toolCalls 
     * @param messages 
     */
    private async handleToolCalls(ws: WebSocket, campId: number, toolCalls: any[], messages: any[]) {
        for (const toolCall of toolCalls) {
            const tool = this.tools[toolCall.name];
            const args = toolCall.arguments ?? toolCall.parameters;
            if (tool) {
                const toolResult = await tool.handler(args);
                const toolMessage = tool.message(toolResult);
                ws.send(toolMessage);

                const followUp = await this.env.AI.run(this.model, {
                    messages: [...messages, { role: 'assistant', content: toolMessage }]
                }) as { response: string };

                await this.saveChatMessage(campId, 'ai', followUp.response);
                ws.send(followUp.response);
            }
        }
    }

    /**
     * Handles incoming Websocket messages
     * Retrieves the chat history for the camp and builds the messages array for the AI model
     * Stores the user message in D1 Database
     * Sends the message content + Chat History to LLama 3.3 AI API
     * Returns the response to the client
     * @param ws 
     * @param message 
     */
    async webSocketMessage(ws: WebSocket, message: string) {
        const campID = ws.deserializeAttachment().campId;

        const messages = await this.buildMessages(campID, message);
        await this.saveChatMessage(campID, 'user', message);
        const response = await this.runAI(messages, message);

        const toolCallFromResponse =
            response.response && typeof response.response === 'object' && (response.response as any).type === 'function'
                ? [response.response as any]
                : response.tool_calls;

        if (toolCallFromResponse && toolCallFromResponse.length > 0) {
            await this.handleToolCalls(ws, campID, toolCallFromResponse, messages);
        } else {
            await this.saveChatMessage(campID, 'ai', response.response);
            ws.send(response.response);
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