import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"

export class ProductsStack extends cdk.Stack {
    
    //Leitura de produtos
    readonly productsFetchHandler: lambdaNodeJs.NodejsFunction

    constructor(scope: Construct, id:string, props?: cdk.StackProps){
        super(scope, id, props)

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
        })
    }
}
