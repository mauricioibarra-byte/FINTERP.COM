import * as cdk from 'aws-cdk-lib';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

export class BusStack extends cdk.Stack {
    public readonly bus: events.EventBus;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Central Event Bus for Decoupled Microservices
        this.bus = new events.EventBus(this, 'FintERPBus', {
            eventBusName: 'FintERP-Central-Bus',
        });

        // Archive all events for debugging/replay (Essential for Enterprise)
        this.bus.archive('FintERPBusArchive', {
            archiveName: 'FintERP-All-Events',
            eventPattern: {
                account: [cdk.Stack.of(this).account],
            },
            retention: cdk.Duration.days(90), // Keep 3 months of history
        });

        new cdk.CfnOutput(this, 'BusName', {
            value: this.bus.eventBusName,
            exportName: 'FintERP-BusName',
        });

        new cdk.CfnOutput(this, 'BusArn', {
            value: this.bus.eventBusArn,
            exportName: 'FintERP-BusArn',
        });
    }
}
