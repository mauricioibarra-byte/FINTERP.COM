#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/foundation/network-stack';
import { DataStack } from '../lib/data/data-stack';
import { BusStack } from '../lib/core/bus-stack';
import { ApiStack } from '../lib/core/api-stack';
import { FrontendStack } from '../lib/presentation/frontend-stack';

try {
  const app = new cdk.App();

  // Default to 'Dev' if not specified
  const targetEnv = app.node.tryGetContext('env') || 'Dev';
  const prefix = `FintERP-${targetEnv}`; // e.g., FintERP-Dev

  console.log(`Starting FintERP Infrastructure synthesis for Environment: ${targetEnv}`);

  const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  };

  // 1. Foundation: Network (VPC)
  const network = new NetworkStack(app, `${prefix}-Network`, {
    env,
    environment: targetEnv
  });

  // 2. Data: Storage (Aurora) - Private/Isolated
  const data = new DataStack(app, `${prefix}-Data`, {
    env,
    vpc: network.vpc,
    environment: targetEnv
  });

  // 3. Core: Messaging (EventBridge)
  const bus = new BusStack(app, `${prefix}-Bus`, {
    env,
    environment: targetEnv
  });

  // 4. API: Serverless Backend (Lambda + API Gateway)
  const api = new ApiStack(app, `${prefix}-Api`, {
    env,
    dbSecretArn: data.auroraCluster.secret!.secretArn,
    vpc: network.vpc,
    dbSecurityGroup: data.dbSecurityGroup,
    environment: targetEnv
  });

  // 5. Presentation: Frontend (CloudFront + S3)
  const frontend = new FrontendStack(app, `${prefix}-Frontend`, {
    env,
    environment: targetEnv
  });

  // Tagging Strategy
  cdk.Tags.of(app).add('Project', 'FintERP');
  cdk.Tags.of(app).add('Environment', targetEnv);
  cdk.Tags.of(app).add('ManagedBy', 'CDK');

  console.log("App stack defined successfully.");
} catch (error) {
  console.error("FATAL ERROR in iac.ts:", error);
  process.exit(1);
}

