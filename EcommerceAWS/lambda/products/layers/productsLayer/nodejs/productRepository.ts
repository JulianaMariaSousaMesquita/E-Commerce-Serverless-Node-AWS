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
}