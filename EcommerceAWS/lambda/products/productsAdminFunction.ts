import { Method } from "aws-cdk-lib/aws-apigateway"
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context }from "aws-lambda"
import { Product, ProductRepository } from "/opt/nodejs/productsLayer"
import { DynamoDB } from "aws-sdk"

const ddbProducts = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const productRepository = new ProductRepository(ddbClient, ddbProducts)

export async function handler(event: APIGatewayProxyEvent, 
    context: Context): Promise <APIGatewayProxyResult> {

        const lambdaRequestId = context.awsRequestId
        const apiResquestId = event.requestContext.requestId 
        console.log(`API Gateway RequestId: ${apiResquestId} - lambda RequestId: ${lambdaRequestId}`)
        
        if(event.resource === "/products"){
            console.log("POST /products")
            const product = await JSON.parse(event.body!) as Product
            const productCreated = await productRepository.create(product)
            return{
                statusCode:201,
                body: JSON.stringify(productCreated)
            }
        }else if (event.resource === "products/{id}"){
            const productsId = event.pathParameters!.id as string
            if(event.httpMethod === "PUT"){
                console.log(`PUT /products${productsId}`)
            return{
                statusCode:200,
                body:`PUT /products${productsId}`
            }
            }else if (event.httpMethod === "DELETE"){
                console.log(`DELETE /products${productsId}`)
                try{
                    const product = await productRepository.deleteProduct(productsId)
                    return{
                        statusCode:200,
                        body:JSON.stringify(product)
                    }
                }catch (error){
                    console.error((<Error>error).message)
                    return{
                        statusCode:404,
                        body:(<Error>error).message
                    }
                }
            
            }
        }
        return{
            statusCode: 400,
            body:"Bad request"
        }
    }