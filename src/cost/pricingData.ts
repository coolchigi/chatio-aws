// Pricing data and documentation links for AWS services

export const OPENSEARCH_PRICING = {
  onDemandHourly: 0.209, // or1.large.search, us-east-1
  ebsGbMonth: 0.122, // EBS gp3, us-east-1
  serverlessOcuHourly: 0.24,
  serverlessMinOcu: 2,
  serverlessStorageGbMonth: 0.024,
  hoursPerMonth: 730, // AWS convention for monthly cost
  docs: {
    main: "https://aws.amazon.com/opensearch-service/pricing/",
    ebs: "https://aws.amazon.com/ebs/pricing/",
    calculator: "https://calculator.aws.amazon.com/",
    instance: "https://instances.vantage.sh/aws/opensearch/"
  }
};
