import { createCamp } from '../db/camp';

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
        create_camp: createToolCreateCamp(db)
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
