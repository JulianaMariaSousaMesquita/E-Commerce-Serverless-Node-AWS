import { DocumentClient} from "aws-sdk/clients/dynamodb"
import {v4 as uuid} from "uuid"
export interface Product {
    id: string;
    productName: string;
    code: string;
    price: number;
    model: string;
}

export class ProductRepository {
    //Cliente que vai dar acesso ao dynamodb
    private ddbClient: DocumentClient
    //Nome da tabela
    private ddbProducts: string
    
    constructor (ddbClient: DocumentClient, ddbProducts: string){
        this.ddbClient = ddbClient
        this.ddbProducts = ddbProducts        
    }

    async getAllProducts(): Promise<Product[]>{
        const  data = await this.ddbClient.scan({
            TableName: this.ddbProducts
        }).promise()

        return data.Items as Product[]
    }

    async getProductId(productId: string) : Promise<Product>{
        const data = await this.ddbClient.get({
            TableName:this.ddbProducts,
            Key: {
                id: productId
            }
        }).promise()
        
        if(data.Item){
            return data.Item as Product
        }else{
            throw new Error('Product not found')
        }
    }

    async create(product: Product): Promise<Product>{
        product.id = uuid()
        await this.ddbClient.put({
            TableName:this.ddbProducts,
            Item: product
        }).promise()
        return product
    }

    async deleteProduct(productId: string): Promise<Product>{
        const data = await this.ddbClient.delete({
            TableName: this.ddbProducts,
            Key:{
                id: productId
            },
            ReturnValues:"ALL_OLD"
        }).promise()
        if(data.Attributes){
            return data.Attributes as Product
        }else{
            throw new Error('Product not found')
        }
    }

    async updateProduct(productId: string, product: Product) : Promise<Product>{
        const data = await this.ddbClient.update({
            TableName: this.ddbProducts,
            Key:{
                id: productId
            },
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues:"UPDATED_NEW",
            UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m",
            ExpressionAttributeValues: {
                ":n": product.productName,
                ":c": product.code,
                ":p": product.price,
                ":m": product.model
            }
        }).promise()
        data.Attributes!.id = productId
        return data.Attributes as Product
    }
}