import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class NetworkStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC "The Backbone"
    // Designed for High Availability (2 AZs) and Security (Private Subnets for DB/Lambda)
    this.vpc = new ec2.Vpc(this, 'FintERPVPC', {
      maxAzs: 2, // 2 AZs is sufficient for HA without over-provisioning cost
      natGateways: 1, // Start with 1 NAT Gateway to save costs (approx $30/mo). Scale to 2 for PROD.
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, // For Lambdas that need internet
        },
        {
          cidrMask: 28,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // For DBs (Aurora/QLDB) - No Internet Access
        }
      ],
    });

    // Output VPC ID for other stacks
    new cdk.CfnOutput(this, 'VpcId', {
      value: this.vpc.vpcId,
      exportName: 'FintERPVpcId',
    });
  }
}
