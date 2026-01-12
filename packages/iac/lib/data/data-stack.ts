import * as cdk from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface DataStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
    environment: string;
}

export class DataStack extends cdk.Stack {
    public readonly auroraCluster: rds.DatabaseCluster;
    public readonly dbSecurityGroup: ec2.SecurityGroup;


    constructor(scope: Construct, id: string, props: DataStackProps) {
        super(scope, id, props);

        // 1. Security Group for DB
        this.dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
            vpc: props.vpc,
            description: 'Allow access to Aurora DB',
            allowAllOutbound: true,
        });

        // Allow ingress from within VPC (e.g. Lambda)
        this.dbSecurityGroup.addIngressRule(
            ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
            ec2.Port.tcp(5432),
            'Allow PostgreSQL access from within VPC'
        );

        // 2. Aurora Serverless v2 Cluster
        // Environment specific configuration
        const isProd = props.environment === 'Prod';
        const minCapacity = isProd ? 0.5 : 0.5; // Cost saving for Dev (0.5 ACU)
        const maxCapacity = isProd ? 4 : 1;     // Limit Dev max scale

        this.auroraCluster = new rds.DatabaseCluster(this, 'AuroraCluster', {
            engine: rds.DatabaseClusterEngine.auroraPostgres({
                version: rds.AuroraPostgresEngineVersion.VER_14_6,
            }),
            writer: rds.ClusterInstance.serverlessV2('Writer'),
            // Optional: Add reader for production HA if needed, keeping cost low for now
            // readers: isProd ? [rds.ClusterInstance.serverlessV2('Reader')] : [], 
            serverlessV2MinCapacity: minCapacity,
            serverlessV2MaxCapacity: maxCapacity,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            },
            securityGroups: [this.dbSecurityGroup],
            defaultDatabaseName: 'finterp',
            storageEncrypted: true,
            deletionProtection: isProd, // Protect Prod DB
            removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY, // Snapshot vs Destroy
        });

        // Output DB Credentials (Secret ARN)
        new cdk.CfnOutput(this, 'DbSecretArn', {
            value: this.auroraCluster.secret?.secretArn || '',
            exportName: `FintERP-DbSecretArn-${props.environment}`,
        });


    }
}
