import { APIGatewayProxyEvent, APIGatewayProxyResult, Context }from "aws-lambda"
import { ProductRepository } from "/opt/nodejs/productsLayer"
import { DynamoDB } from "aws-sdk"

const ddbProducts = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, ddbProducts)
 
export async function handler(event: APIGatewayProxyEvent, 
    context: Context): Promise <APIGatewayProxyResult> {

        const lambdaRequestId = context.awsRequestId
        const apiResquestId = event.requestContext.requestId 
        console.log(`API Gateway RequestId: ${apiResquestId} - lambda RequestId: ${lambdaRequestId}`)
        
        const method = event.httpMethod 

        if(event.resource === "/products"){
            if(method === "GET"){
                console.log('GET /Products')
                const products = await productRepository.getAllProducts()
                return {
                    statusCode: 200,
                    body: JSON.stringify(products)
                }
            }
        }else if(event.resource === "/products/{id}"){
            const productId =  event.pathParameters!.id as string
            console.log(`GET / products/${productId}`)
            return {
                statusCode:200,
                body: `GET / products/${productId}`
            }
        }

        return {
            statusCode: 400,
            body: JSON.stringify({
                message:"Bad request"
            })
        }
    }