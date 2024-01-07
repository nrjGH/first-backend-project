class ApiResponse{
    constructor(statusCode, data, message="Success"){               //if a response is being sent message is generally success but can be overridden
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.success=statusCode < 400       // statuscodes are generally given by the company in form of "specsheet", in startup they are made by us. (<400) for responses and (>400) for errors
    }
}