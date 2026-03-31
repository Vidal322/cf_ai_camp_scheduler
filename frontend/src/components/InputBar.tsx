import { useState } from 'react'
import './InputBar.css'                                                                                                                                                                     

type InputBarProps = {
    sendMessage: (content: string) => void
    status: 'open' | 'closed' | 'error' | 'connecting'
}
                                                                                                                                                                                            
export function InputBar({ sendMessage, status } : InputBarProps) {                                                                                                                                         
    const [value, setValue] = useState('')                                                                                                                                                  
                                                                                                                                                                                            
    function handleSubmit() {                                                                                                                                                               
        if (value.trim() === '') return                                                                                                                                                     
        sendMessage(value)                                                                                                                                                                  
        setValue('')                                                                                                                                        
    }                                                                                                                                                                                       
                                                                                                                                                                                            
    return (                                                                                                                                                                                
        <div className='input-bar'>
            <input                                                                                                                                                                          
                value={value}                                                                                                                                                               
                onChange={(e) => setValue(e.target.value)}                                                                                                                                  
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                placeholder='Type your message here...'                                                                                                                                     
            />                                                                                                                                                                              
            <button                                                                                                                                                                         
                onClick={handleSubmit}                                                                                                                                                      
                disabled={status !== 'open'}                                                                                                                                                
            >                                                                                                                                                                               
                Send                                                                                                                                                                        
            </button>                                                                                                                                                                       
        </div>                                                                                                                                                                              
    )           
}        