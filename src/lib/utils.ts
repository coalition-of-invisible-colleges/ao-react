// This file is used to store simple (and less simple) data operations on javascript types

export const convertToDuration = (milliseconds: number) => {                                                                                                                                                                      
    const stringifyTime = (time: number): string => String(time).padStart(2, '0')                                                                                                                                                   
    const seconds = Math.floor(milliseconds / 1000);                                                                                                                                                                                
    const minutes = Math.floor(seconds / 60);                                                                                                                                                                                       
    const hours = Math.floor(minutes / 60);                                                                                                                                                                                         
    return `${stringifyTime(hours)}:${stringifyTime(minutes % 60)}:${stringifyTime(seconds % 60)}`                                                                                                                                  
}                                                                                                                                                                                                                                 

export const convertToTimeWorked = (milliseconds: number) => {                                                                                                                                                                      
    const seconds = Math.floor(milliseconds / 1000);                                                                                                                                                                                
    const minutes = Math.floor(seconds / 60);                                                                                                                                                                                       
    const hours = Math.floor(minutes / 60);                                                                                                                                                                                         

    if (hours > 0) {
        return `${hours}h, ${minutes % 60}m`                                                                                                                                  
    } else {
        return `${minutes % 60}m`                                                                                                                                  
    }
}                                                                                                                                                                                                                                 
                                          
