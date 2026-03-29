import { createCamp, createActivity, createRoom, createSchedule } from '../db/index';

export interface AiTool {
    definition: {
          type: string,                                                                                                                                                                       
          function: {
              name: string,
              description: string,
              parameters: {                                                                                                                                                                   
                  type: string,
                  properties: { [k: string]: { type: string, description: string } },                                                                                                         
                  required?: string[]                                                                                                                                                         
              }
          }                                                                                                                                                                                   
    },
    handler: (args: any) => Promise<any>,
    message: (result: any) => string
};

                                                                                                                                                                                              
export function createTools(db: D1Database): Record<string, AiTool> {    
    return {
        create_camp: createToolCreateCamp(db),
        create_activity: createToolCreateActivity(db),
        create_room: createToolCreateRoom(db),
        create_schedule: createToolCreateSchedule(db)
    }
}

function createToolCreateActivity(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'create_activity',
                description: 'Creates a new activity for a summer camp',
                parameters: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Name of the activity' },
                        category: { type: 'string', description: 'Category of the activity: sport, cultural, or slow' },
                        is_indoor: { type: 'number', description: 'Whether the activity is indoor (1) or outdoor (0)' },
                        description: { type: 'string', description: 'Description of the activity' }
                    },
                    required: ['name', 'category', 'is_indoor', 'description']
                }
            }
        },
        handler: (args) => createActivity(db, args.name, args.category, args.is_indoor, args.description),
        message: (result) => `[Tool Used: Create Activity] Activity created with id ${result}`
    }
}

function createToolCreateSchedule(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'create_schedule',
                description: 'Creates a new empty schedule for a camp',
                parameters: {
                    type: 'object',
                    properties: {
                        camp_id: { type: 'number', description: 'The id of the camp to create the schedule for' }
                    },
                    required: ['camp_id']
                }
            }
        },
        handler: (args) => createSchedule(db, args.camp_id),
        message: (result) => `[Tool Used: Create Schedule] Schedule created with id ${result}`
    }
}

function createToolCreateRoom(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'create_room',
                description: 'Creates a new room for a summer camp',
                parameters: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Name of the room' },
                        capacity: { type: 'number', description: 'Maximum number of campers the room can hold' },
                        is_indoor: { type: 'number', description: 'Whether the room is indoor (1) or outdoor (0)' },
                        description: { type: 'string', description: 'Description of the room' }
                    },
                    required: ['name', 'capacity', 'is_indoor', 'description']
                }
            }
        },
        handler: (args) => createRoom(db, args.name, args.capacity, args.is_indoor, args.description),
        message: (result) => `[Tool Used: Create Room] Room created with id ${result}`
    }
}

function createToolCreateCamp(db: D1Database,): AiTool {
    return {                                                                                                                                                                                
            definition: {
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
            },                                                                                                                                                                              
            handler: (args) => createCamp(db, args.name, args.description, args.quantity, args.start_date, args.end_date),
            message: (result) => `[Tool Used: Create Camp] Camp created with id ${result}`                                                                                                                                                                                                                                                                                  
    }                                                                                                                                                                                       
}
