import { APIGatewayProxyEvent, APIGatewayProxyResult, Context }from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent, 
    context: Context): Promise <APIGatewayProxyResult> {

        const lambdaRequestId = context.awsRequestId
        const apiResquestId = event.requestContext.requestId 
        console.log(`API Gateway RequestId: ${apiResquestId} - lambda RequestId: ${lambdaRequestId}`)
        
        const method = event.httpMethod 

        if(event.resource === "/products"){
            if(method === "GET"){
                console.log('GET')
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: "GET Produtct - OK"
                    })
                }
            }
        }

        return {
            statusCode: 400,
            body: JSON.stringify({
                message:"Bad request"
            })
        }
    }