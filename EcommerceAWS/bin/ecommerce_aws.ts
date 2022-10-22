#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsStack } from '../lib/products-stack';
import { ECommerceStack } from '../lib/ecommerce-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: "335244021253",
  region: "us-east-1"
}

const tags = {
  cost: "ECommerce",
  team: "JulianaMesquita"
}

const productsStack = new ProductsStack(app, "ProductsApp", {
  tags: tags,
  env: env
})

const eCommerceStack = new ECommerceStack(app, "ECommerceApi", {
  productsFetchHandler: productsStack.productsFetchHandler,
  tags: tags,
  env: env
})

eCommerceStack.addDependency(productsStack)

