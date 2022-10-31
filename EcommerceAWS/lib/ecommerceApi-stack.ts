import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import * as cognito from "aws-cdk-lib/aws-cognito"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { Construct } from "constructs"

interface ECommerceStackProps extends cdk.StackProps {
    productsFetchHandler: lambdaNodeJs.NodejsFunction
    productsAdminHandler: lambdaNodeJs.NodejsFunction
}

export class ECommerceApiStack extends cdk.Stack{
    private productAuthorizer: apigateway.CognitoUserPoolsAuthorizer
    private customerPool: cognito.UserPool
    private adminPool: cognito.UserPool

    constructor(scope: Construct, id:string, props: ECommerceStackProps){
        super(scope, id, props)

        const logGroup = new cwlogs.LogGroup(this, "ECommerceApiLogs")
        const api = new apigateway.RestApi(this, "ECommerceApi",{
            restApiName: "EcommerceApi",
            cloudWatchRole: true,
            deployOptions:{
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true,
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    caller: true,
                    user: true
                })
            }
        })

        const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler)
        
        const procudctsFetchWebMobileIntegrationOption = {
            authorizer: this.productAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
            authorizationScopes: ['customer/web', 'customer/mobile']
        }
        
        const procudctsFetchWebIntegrationOption = {
            authorizer: this.productAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
            authorizationScopes: ['customer/web']
        }

        // "/products"
        const productsResource = api.root.addResource("products")
        productsResource.addMethod("GET", productsFetchIntegration, procudctsFetchWebMobileIntegrationOption)

        // "/products/{id}"
        const productIdResource = productsResource.addResource("{id}")
        productIdResource.addMethod("GET", productsFetchIntegration, procudctsFetchWebIntegrationOption )

        const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminHandler)
        // POST /products
        productsResource.addMethod("POST", productsAdminIntegration)
        
        // PUT /procudcts/{id}
        productIdResource.addMethod("PUT", productsAdminIntegration)

        // DELETE /products/{id}
        productIdResource.addMethod("DELETE", productsAdminIntegration)

        this.createCognitoAuth()
    }

    private createCognitoAuth(){
        //Cognito customer UserPool (Usuários que podem acessar plataforma para pesquisar produtos)
        this.customerPool = new cognito.UserPool(this, "CustomerPool", {
            userPoolName: "CustomerPool",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            selfSignUpEnabled: true,
            autoVerify: {
                email: true,
                phone: false
            },
            userVerification: {
                emailSubject: "Verifique o seu e-mail para acessar o serviço de E-commerce!",
                emailBody: "Obrigada por se registrar! Seu codigo de verificação : {####}",
                emailStyle: cognito.VerificationEmailStyle.CODE
            },
            signInAliases: {
                username: false,
                email: true
            },
            standardAttributes: {
                fullname: {
                    required: true,
                    mutable: false
                }                
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
                tempPasswordValidity: cdk.Duration.days(3)
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
        })

        this.customerPool.addDomain("CustomerDomain", {
            cognitoDomain: {
                domainPrefix: "julianamesquita-customer-service"
            }
        })

        const customerWebScope = new cognito.ResourceServerScope({
            scopeName: "web",
            scopeDescription: "Customer Web Operation"
        })

        const customerMobileScope = new cognito.ResourceServerScope({
            scopeName: "mobile",
            scopeDescription: "Customer mobile Operation"
        })

        const customerResourceServer = this.customerPool.addResourceServer("CustomerResourceServer", {
            identifier: "customer",
            userPoolResourceServerName: "CustomerResourceServer",
            scopes: [customerWebScope, customerMobileScope]
        })

        this.customerPool.addClient("customer-web-client", {
            userPoolClientName: "customerWebClient",
            authFlows: {
                userPassword: true
            },
            accessTokenValidity: cdk.Duration.minutes(60),
            refreshTokenValidity: cdk.Duration.days(7),
            oAuth: {
                scopes: [cognito.OAuthScope.resourceServer(customerResourceServer, customerWebScope)]
            }
        })

        this.customerPool.addClient("customer-mobile-client", {
            userPoolClientName: "customerMobileClient",
            authFlows: {
                userPassword: true
            },
            accessTokenValidity: cdk.Duration.minutes(60),
            refreshTokenValidity: cdk.Duration.days(7),
            oAuth: {
                scopes: [cognito.OAuthScope.resourceServer(customerResourceServer, customerMobileScope)]
            }
        })

        this.productAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, "ProductsAuthorizer", {
            authorizerName: "ProductsAuthorizer",
            cognitoUserPools: [this.customerPool]
        })


        
    }
}
