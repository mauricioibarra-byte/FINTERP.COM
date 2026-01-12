import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3_assets from 'aws-cdk-lib/aws-s3-assets';

interface ApiStackProps extends cdk.StackProps {
    dbSecretArn: string;
    vpc: ec2.Vpc;
    dbSecurityGroup: ec2.SecurityGroup;
    environment: string;
}

export class ApiStack extends cdk.Stack {
    public readonly api: apigateway.LambdaRestApi;

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const suffix = `-${props.environment}`;

        // 1. Get DB Secret
        const dbSecret = secretsmanager.Secret.fromSecretCompleteArn(this, 'DbSecret', props.dbSecretArn);

        // 2. Define Lambda Function (NestJS Monolith)
        const lambdaFunction = new nodejs.NodejsFunction(this, 'FintERPApiFunction', {
            entry: path.join(__dirname, '../../../../apps/backend/src/lambda.ts'),
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_18_X,
            memorySize: props.environment === 'Prod' ? 1024 : 512,
            timeout: cdk.Duration.seconds(30),
            environment: {
                NODE_ENV: props.environment === 'Prod' ? 'production' : 'development',
                // Construct DATABASE_URL from Secret (JSON)
                // postgresql://username:password@host:port/dbname?schema=public
                DATABASE_URL: `postgresql://${dbSecret.secretValueFromJson('username').unsafeUnwrap()}:${dbSecret.secretValueFromJson('password').unsafeUnwrap()}@${dbSecret.secretValueFromJson('host').unsafeUnwrap()}:${dbSecret.secretValueFromJson('port').unsafeUnwrap()}/finterp?schema=public`,
                NO_COLOR: 'true',
            },
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // Needs internet for external APIs (e.g. Stripe, SII)
            },
            securityGroups: [props.dbSecurityGroup], // Access to DB
            bundling: {
                minify: props.environment === 'Prod',
                sourceMap: true,
                externalModules: ['@nestjs/microservices', '@nestjs/websockets', 'class-transformer/storage'], // Exclude optional dependencies
            }
        });

        // Grant Lambda access to read Secret (just in case code needs it directly, currently Env var uses it)
        dbSecret.grantRead(lambdaFunction);

        // 3. API Gateway (Proxy to Lambda)
        this.api = new apigateway.LambdaRestApi(this, 'FintERPApiGateway', {
            handler: lambdaFunction,
            proxy: true,
            deployOptions: {
                stageName: props.environment.toLowerCase(),
                tracingEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS, // TODO: Lock down to CloudFront URL
                allowMethods: apigateway.Cors.ALL_METHODS,
            }
        });

        // 4. Outputs
        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.api.url,
            exportName: `FintERP-ApiUrl-${props.environment}`,
        });
    }
}
