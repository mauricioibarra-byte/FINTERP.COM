#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/foundation/network-stack';
import { DataStack } from '../lib/data/data-stack';
import { BusStack } from '../lib/core/bus-stack';

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

// 1. Foundation: Network (VPC)
const network = new NetworkStack(app, 'FintERP-Network', { env });

// 2. Data: Storage (Aurora + QLDB) - Depends on Network
const data = new DataStack(app, 'FintERP-Data', {
  env,
  vpc: network.vpc,
});

// 3. Core: Messaging (EventBridge)
const bus = new BusStack(app, 'FintERP-Bus', { env });

// 4. API: Headless Gateway (AppSync)
import { ApiStack } from '../lib/core/api-stack';
const api = new ApiStack(app, 'FintERP-Api', { env });

// Tagging Strategy (Cost Allocation)
cdk.Tags.of(app).add('Project', 'FintERP');
cdk.Tags.of(app).add('Environment', 'Dev');
cdk.Tags.of(app).add('ManagedBy', 'CDK');
