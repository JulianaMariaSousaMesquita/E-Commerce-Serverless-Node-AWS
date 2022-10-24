import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import { Construct } from "constructs"

export class ProductsAppStack extends cdk.Stack {
    
    //Leitura de produtos
    readonly productsFetchHandler: lambdaNodeJs.NodejsFunction

    //Cadastrar, deletar e alterar produtos
    readonly productsAdminHandler: lambdaNodeJs.NodejsFunction 

    //tabela products
    readonly productsDdb: dynamodb.Table

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

        this.productsDdb = new dynamodb.Table(this, "ProductsDdb", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })

        this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this, 
            "productsFetchFunction", {
                functionName: "productsFetchFunction",
                entry: "lambda/products/productsFetchFunction.ts",
                handler: "handler",
                memorySize: 128,
                timeout: cdk.Duration.seconds(5),
                bundling: {
                   minify:  true,
                   sourceMap: false
                },
                environment: {
                    PRODUCTS_DDB: this.productsDdb.tableName
                }
        })
        //Permissão de leitura
        this.productsDdb.grantReadData(this.productsFetchHandler)

        this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(this, 
            "productsAdminFunction", {
                functionName: "productsAdminFunction",
                entry: "lambda/products/productsAdminFunction.ts",
                handler: "handler",
                memorySize: 128,
                timeout: cdk.Duration.seconds(5),
                bundling: {
                   minify:  true,
                   sourceMap: false
                },
                environment: {
                    PRODUCTS_DDB: this.productsDdb.tableName
                }
        })

        //Permissão de escrita
        this.productsDdb.grantWriteData(this.productsAdminHandler)

    }
}
