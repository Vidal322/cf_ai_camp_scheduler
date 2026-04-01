import { createCamp, createActivity, createRoom, createSchedule, assignSlot, getActivities, getRooms, searchActivities, searchRooms, getSchedule } from '../db/index';

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
        create_schedule: createToolCreateSchedule(db),
        assign_slot: createToolAssignSlot(db),
        get_activities: createToolGetActivities(db),
        get_rooms: createToolGetRooms(db),
        get_schedule: createToolGetSchedule(db)
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

function createToolGetActivities(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'get_activities',
                description: 'Retrieves all available activities with their ids, names, categories and descriptions',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        },
        handler: () => getActivities(db),
        message: (result) => `[Tool Used: Get Activities] Activities: ${JSON.stringify(result)}`
    }
}

function createToolGetRooms(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'get_rooms',
                description: 'Retrieves all available rooms with their ids, names, capacities and descriptions',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: []
                }
            }
        },
        handler: () => getRooms(db),
        message: (result) => `[Tool Used: Get Rooms] Rooms: ${JSON.stringify(result)}`
    }
}

function createToolGetSchedule(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'get_schedule',
                description: 'Retrieves the full schedule for a camp, showing all assigned activities, rooms, days and periods',
                parameters: {
                    type: 'object',
                    properties: {
                        schedule_id: { type: 'number', description: 'The id of the schedule' }
                    },
                    required: ['schedule_id']
                }
            }
        },
        handler: (args) => getSchedule(db, args.schedule_id),
        message: (result) => `[Tool Used: Get Schedule] Schedule: ${JSON.stringify(result)}`
    }
}

function createToolAssignSlot(db: D1Database): AiTool {
    return {
        definition: {
            type: 'function',
            function: {
                name: 'assign_slot',
                description: 'Assigns an activity to a schedule slot for a specific day and period, given the activity name, room name, day and periord, and schedule number of a camp. It will search for the activity and room based on the provided names and use the first result to assign the slot.',
                parameters: {
                    type: 'object',
                    properties: {
                        schedule_id: { type: 'number', description: 'The id of the schedule' },
                        activity_name: { type: 'string', description: 'The name of the activity' },
                        room_name: { type: 'string', description: 'The name or description of the room' },
                        day: { type: 'number', description: 'Day of the week (1-7)' },
                        period: { type: 'string', description: 'Period of the day: morning or afternoon' }
                    },
                    required: ['schedule_id', 'activity_name', 'room_name', 'day', 'period']
                }
            }
        },
        handler: async (args) => {
            const activities = await searchActivities(db, args.activity_name) as { id: number, name: string }[];
            const rooms = await searchRooms(db, args.room_name) as { id: number, name: string }[];
            if (!activities.length) throw new Error(`No activity found matching '${args.activity_name}'`);
            if (!rooms.length) throw new Error(`No room found matching '${args.room_name}'`);
            return assignSlot(db, args.schedule_id, activities[0].id, rooms[0].id, args.day, args.period);
        },
        message: (result) => `[Tool Used: Assign Slot] Slot assigned with id ${result}`
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
