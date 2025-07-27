export const isEmpty=(value)=>{
    return(
        (typeof value === "object" && Object.keys(value).length === 0)||
        (typeof value === "string" && value.trim().length===0)
        )
    }
 