import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';

export class ApiStack extends cdk.Stack {
    public readonly api: appsync.GraphqlApi;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // AppSync GraphQL API - The "Headless" Gateway
        // Unified endpoint for ERP Web, Mobile App, and POS
        this.api = new appsync.GraphqlApi(this, 'FintERPApi', {
            name: 'FintERP-Unified-API',
            definition: appsync.Definition.fromFile('schema.graphql'), // We will create this placeholder
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY, // Dev mode. PROD use COGNITO_USER_POOLS
                    apiKeyConfig: {
                        expires: cdk.Expiration.after(cdk.Duration.days(365)),
                    },
                },
            },
            xrayEnabled: true, // Observability
        });

        new cdk.CfnOutput(this, 'ApiUrl', {
            value: this.api.graphqlUrl,
            exportName: 'FintERP-ApiUrl',
        });

        new cdk.CfnOutput(this, 'ApiKey', {
            value: this.api.apiKey || '',
            exportName: 'FintERP-ApiKey',
        });
    }
}
