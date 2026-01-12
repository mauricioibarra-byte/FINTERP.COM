import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';

interface FrontendStackProps extends cdk.StackProps {
    environment: string;
}

export class FrontendStack extends cdk.Stack {
    public readonly distributionUrl: string;

    constructor(scope: Construct, id: string, props: FrontendStackProps) {
        super(scope, id, props);

        // 1. S3 Bucket for Static Assets
        const websiteBucket = new s3.Bucket(this, 'FrontendBucket', {
            // websiteIndexDocument: 'index.html', // Removed to force REST endpoint for OAI
            // websiteErrorDocument: 'index.html', // Removed to force REST endpoint for OAI
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: props.environment === 'Dev' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
            autoDeleteObjects: props.environment === 'Dev',
            encryption: s3.BucketEncryption.S3_MANAGED,
        });

        // 1.5 Origin Access Identity (OAI)
        const oai = new cloudfront.OriginAccessIdentity(this, 'FrontendOAI');
        websiteBucket.grantRead(oai);

        // 2. CloudFront Distribution
        const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket, { originAccessIdentity: oai }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
                cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
                compress: true,
            },
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
                {
                    httpStatus: 404, // SPA Routing catch-all
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                }
            ],
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Cheapest (NA/EU)
        });

        // 3. Deployment (Upload 'out' folder)
        // We assume 'npm run build' generates an 'out' folder in apps/frontend
        // This is optional here; usually done via CI/CD, but good for initial bootstrapping
        /*
        new s3deploy.BucketDeployment(this, 'DeployNextJS', {
          sources: [s3deploy.Source.asset(path.join(__dirname, '../../../../apps/frontend/out'))],
          destinationBucket: websiteBucket,
          distribution,
          distributionPaths: ['/*'],
        });
        */

        this.distributionUrl = distribution.distributionDomainName;

        // Outputs
        new cdk.CfnOutput(this, 'DistributionUrl', {
            value: `https://${distribution.distributionDomainName}`,
            exportName: `FintERP-${props.environment}-FrontendUrl`,
        });

        new cdk.CfnOutput(this, 'BucketName', {
            value: websiteBucket.bucketName,
            exportName: `FintERP-${props.environment}-BucketName`,
        });
    }
}
