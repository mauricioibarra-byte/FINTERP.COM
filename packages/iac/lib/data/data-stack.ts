import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as qldb from 'aws-cdk-lib/aws-qldb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface DataStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class DataStack extends cdk.Stack {
    public readonly auroraCluster: rds.ServerlessCluster;
    public readonly ledger: qldb.CfnLedger;

    constructor(scope: Construct, id: string, props: DataStackProps) {
        super(scope, id, props);

        // 1. QLDB - The Universal Journal (Immutable Ledger)
        this.ledger = new qldb.CfnLedger(this, 'FintERPLedger', {
            name: 'FintERP-Universal-Journal',
            permissionsMode: 'STANDARD',
            deletionProtection: false, // Set to TRUE for production to prevent accidental data loss
        });

        // 2. Aurora Serverless v2 (PostgreSQL) - Operational Data
        // Replaces SAP HANA with auto-scaling, pay-per-use architecture

        // Security Group for Database
        const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
            vpc: props.vpc,
            description: 'Allow access to Aurora Serverless',
            allowAllOutbound: true, // Allow DB to reach out if needed (e.g. extensions)
        });

        // Aurora Serverless Cluster
        // Note: Using L2 construct for Aurora Serverless v1 is deprecated effectively, 
        // v2 is managed via standard DatabaseCluster with serverless V2 scaling config
        const cluster = new rds.DatabaseCluster(this, 'FintERPAuroraCluster', {
            engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_2 }), // Modern PG version
            vpc: props.vpc,
            writer: rds.ClusterInstance.serverlessV2('Writer'),
            readers: [
                // Optional: Add reader for Reporting scale if needed immediately
                // rds.ClusterInstance.serverlessV2('Reader') 
            ],
            serverlessV2MinCapacity: 0.5, // 0.5 ACU (approx 1GB RAM) - Minimum cost when idle
            serverlessV2MaxCapacity: 16,  // Scale up to 32GB RAM for bursts (Black Friday)
            defaultDatabaseName: 'finterp_core',
            storageEncrypted: true,
            securityGroups: [dbSecurityGroup],
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            deletionProtection: false, // Enable for PROD
        });

        // 3. DynamoDB - Commerce Engine (Hot Storage)
        // Handles Black Friday peaks with single-digit ms latency

        // Product Catalog (High Reads)
        const productTable = new cdk.aws_dynamodb.Table(this, 'CommerceProductTable', {
            tableName: 'FintERP-Commerce-Products',
            partitionKey: { name: 'productId', type: cdk.aws_dynamodb.AttributeType.STRING },
            billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST, // Serverless (On-Demand)
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For Dev
        });

        // Shopping Carts (High Writes/Ephemeral)
        const cartTable = new cdk.aws_dynamodb.Table(this, 'CommerceCartTable', {
            tableName: 'FintERP-Commerce-Carts',
            partitionKey: { name: 'cartId', type: cdk.aws_dynamodb.AttributeType.STRING },
            timeToLiveAttribute: 'ttl', // Auto-delete abandoned carts
            billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // User Sessions (High Concurrency)
        const sessionTable = new cdk.aws_dynamodb.Table(this, 'CommerceSessionTable', {
            tableName: 'FintERP-Commerce-Sessions',
            partitionKey: { name: 'sessionId', type: cdk.aws_dynamodb.AttributeType.STRING },
            timeToLiveAttribute: 'expiresAt',
            billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        // Output DB Credentials (Secret ARN)
        new cdk.CfnOutput(this, 'DbSecretArn', {
            value: cluster.secret?.secretArn || '',
            exportName: 'FintERP-DbSecretArn',
        });

        // Output Ledger Name
        new cdk.CfnOutput(this, 'LedgerName', {
            value: this.ledger.name || 'FintERP-Universal-Journal',
            exportName: 'FintERP-LedgerName',
        });
    }
}
