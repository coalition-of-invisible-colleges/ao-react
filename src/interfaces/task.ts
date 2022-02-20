export type GridStyle = 'grid' | 'pyramid'

export interface Grid {                                                                                                                                                                                                           
    rows: {}                                                                                                                                                                                                                        
    height: number                                                                                                                                                                                                                  
    width: number                                                                                                                                                                                                                   
    size: number                                                                                                                                                                                                                    
}                                                                                                                                                                                                                                 
  

export interface Task {                                                                                                                                                                                                           
    taskId: string                                                                                                                                                                                                                  
    color: string                                                                                                                                                                                                                   
    deck: string[]                                                                                                                                                                                                                  
    name: string                                                                                                                                                                                                                    
    address: string                                                                                                                                                                                                                 
    bolt11: string                                                                                                                                                                                                                  
    book: {                                                                                                                                                                                                                         
        memberId: string                                                                                                                                                                                                              
        startTs: number                                                                                                                                                                                                               
        endTs: number                                                                                                                                                                                                                 
    }                                                                                                                                                                                                                               
    boost: number                                                                                                                                                                                                                   
    allocations: Allocation[]                                                                                                                                                                                                       
    priorities: string[]                                                                                                                                                                                                            
    subTasks: string[]                                                                                                                                                                                                              
    completed: string[]                                                                                                                                                                                                             
    parents: string[]                                                                                                                                                                                                               
    claimed: string[]                                                                                                                                                                                                               
    claimInterval?: number                                                                                                                                                                                                          
    signed: Signature[]                                                                                                                                                                                                             
    passed: number[]                                                                                                                                                                                                                
    giftCount?: number                                                                                                                                                                                                              
    guild: string                                                                                                                                                                                                                   
    lastClaimed: number                                                                                                                                                                                                             
    goal?: number                                                                                                                                                                                                                   
    payment_hash: string                                                                                                                                                                                                            
    highlights: number[]                                                                                                                                                                                                            
    seen: Userseen[]                                                                                                                                                                                                                
    // time: Usertime[] // deprecated                                                                                                                                                                                               
    timelog: LabourTime[]                                                                                                                                                                                                           
    created: number                                                                                                                                                                                                                 
    grid?: Grid                                                                                                                                                                                                                     
    gridStyle?: GridStyle                                                                                                                                                                                                           
    avatars?: AvatarLocation[]                                                                                                                                                                                                      
    showChatroom?: boolean                                                                                                                                                                                                          
    showStash?: boolean                                                                                                                                                                                                             
    memberships: Membership[]                                                                                                                                                                                                       
    stash: {}                                                                                                                                                                                                                       
    loadedFromServer?: boolean                                                                                                                                                                                                      
    aoGridToolDoNotUpdateUI?: boolean                                                                                                                                                                                               
    unionHours: number                                                                                                                                                                                                              
    unionSkill: number                                                                                                                                                                                                              
    unionHazard: number                                                                                                                                                                                                             
}

export interface Allocation {                                                                                                                                                                                                            
    type?: string                                                                                                                                                                                                                   
    taskId: string                                                                                                                                                                                                                  
    allocatedId: string                                                                                                                                                                                                             
    amount: number                                                                                                                                                                                                                  
    blame?: string                                                                                                                                                                                                                  
} 

export interface Signature {                                                                                                                                                                                                      
    memberId: string                                                                                                                                                                                                                
    timestamp: Date                                                                                                                                                                                                                 
    opinion: number | string                                                                                                                                                                                                        
} 

export interface Userseen {                                                                                                                                                                                                              
      memberId: string                                                                                                                                                                                                                
      timestamp: Date                                                                                                                                                                                                                 
}  

export interface LabourTime {                                                                                                                                                                                                     
    memberId: string                                                                                                                                                                                                                
    taskId: string                                                                                                                                                                                                                  
    inId: string                                                                                                                                                                                                                    
    start: number                                                                                                                                                                                                                   
    stop: number                                                                                                                                                                                                                    
}

export interface AvatarLocation {                                                                                                                                                                                                 
      memberId: string                                                                                                                                                                                                                
        timestamp: number                                                                                                                                                                                                               
        area: number                                                                                                                                                                                                                    
}    

export interface Membership {                                                                                                                                                                                                            
      memberId: string                                                                                                                                                                                                                
      level: number                                                                                                                                                                                                                   
} 
