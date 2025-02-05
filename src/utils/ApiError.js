class ApiError extends Error { // creating class apiError and extending it from Error class of node js we are not directly using the default error class because we want to overwrite it in our own way .
    constructor( // creating constructor and defining the parameters, constructor are the fucntions which are invoked whenever an object of the same class is created.
        statusCode, //status code 
        message = "Something went wrong", // message
        errors = [], // error statck , it is a stack of errors
        stack = "", // i don't know about it
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack) {
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export { ApiError }