class ApiError extends Error {
    constructor(
        statusCode, 
        message="Something went wrong",
        statck="",
        errors=[]
    ) {
        super(message)

        this.statusCode = statusCode;
        this.data = null;
        this.errors = errors;
        this.statck = statck;
        this.message = message;
        this.success = false;
        if(statck){
            this.stack = statck;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }   
}

export {ApiError}