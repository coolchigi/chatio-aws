import React, { useState } from "react";
import {
  Heading,
  Text,
  Flex,
  Button,
  View,
  useTheme,
  Alert,
  Card,
  Badge,
  Radio,
  RadioGroupField,
  Grid,
  Icon,
  CheckboxField,
  TextField,
  SelectField
} from "@aws-amplify/ui-react";

interface DeploymentOptionsProps {
  config: {
    name: string;
    region: string;
    s3Bucket: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  updateConfig: (updates: Partial<{ deploymentOption: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface DeploymentConfig {
  option: string;
  customDomain?: string;
  environmentVariables: Record<string, string>;
  enableAuth: boolean;
  enableHttps: boolean;
  enableCdn: boolean;
}

const DeploymentOptions: React.FC<DeploymentOptionsProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const { tokens } = useTheme();
  const [selectedOption, setSelectedOption] = useState(
    config.deploymentOption || "amplify"
  );
  const [error, setError] = useState("");

  const [deployConfig, setDeployConfig] = useState<DeploymentConfig>({
    option: selectedOption,
    customDomain: "",
    environmentVariables: {
      REACT_APP_AWS_REGION: config.region,
      REACT_APP_S3_BUCKET: config.s3Bucket,
      REACT_APP_VECTOR_DB: config.vectorDatabaseId,
      REACT_APP_MODEL_ID: config.modelId,
      REACT_APP_KB_ID: config.knowledgeBaseId
    },
    enableAuth: true,
    enableHttps: true,
    enableCdn: true
  });

  const deploymentOptions = [
    {
      id: "amplify",
      name: "Deploy to AWS Amplify",
      description: "One-click deployment with managed hosting and CI/CD",
      icon: "M12 2L2 7L12 12L22 7L12 2Z",
      badge: "Recommended",
      badgeVariation: "success" as const,
      features: [
        "Automatic HTTPS and SSL certificates",
        "Global CDN with edge locations",
        "Built-in CI/CD pipeline",
        "Custom domain support",
        "Automatic scaling",
        "Branch-based deployments"
      ],
      pros: [
        "Zero infrastructure management",
        "Integrated with AWS services",
        "Automatic deployments from Git"
      ],
      cons: ["Less control over infrastructure", "Vendor lock-in to AWS"],
      timeToDeployment: "5-10 minutes",
      complexity: "Low"
    },
    {
      id: "cloudformation",
      name: "Export CloudFormation Template",
      description: "Generate Infrastructure as Code for AWS deployment",
      icon: "M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z",
      badge: "Infrastructure as Code",
      badgeVariation: "info" as const,
      features: [
        "Complete infrastructure definition",
        "Version control for infrastructure",
        "Reusable across environments",
        "AWS CloudFormation integration",
        "Stack management and rollback",
        "Parameter-driven configuration"
      ],
      pros: [
        "Full control over infrastructure",
        "Repeatable deployments",
        "Integration with AWS DevOps tools"
      ],
      cons: ["Requires CloudFormation knowledge", "Manual deployment process"],
      timeToDeployment: "15-30 minutes",
      complexity: "Medium"
    },
    {
      id: "cdk",
      name: "Export AWS CDK Code",
      description: "Generate TypeScript CDK code for programmatic deployment",
      icon: "M13 3L4 14H11L10 21L19 10H12L13 3Z",
      badge: "Developer Friendly",
      badgeVariation: "warning" as const,
      features: [
        "TypeScript/Python code generation",
        "Programmatic infrastructure",
        "IDE support and IntelliSense",
        "Unit testing capabilities",
        "Advanced customization",
        "Integration with CI/CD pipelines"
      ],
      pros: [
        "Code-based infrastructure",
        "Advanced customization options",
        "Strong typing and validation"
      ],
      cons: ["Requires CDK knowledge", "More complex setup"],
      timeToDeployment: "20-45 minutes",
      complexity: "High"
    }
  ];

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
    setDeployConfig((prev) => ({ ...prev, option }));
    updateConfig({ deploymentOption: option });
    setError("");
  };

  const updateDeployConfig = (updates: Partial<DeploymentConfig>) => {
    setDeployConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      setError("Please select a deployment option");
      return;
    }
    onNext();
  };

  const selectedDeployment = deploymentOptions.find(
    (opt) => opt.id === selectedOption
  );

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case "low":
        return tokens.colors.green[60];
      case "medium":
        return tokens.colors.orange[60];
      case "high":
        return tokens.colors.red[60];
      default:
        return tokens.colors.neutral[60];
    }
  };

  const getTimeEstimate = (option: string) => {
    const estimates = {
      amplify: "5-10 min",
      cloudformation: "15-30 min",
      cdk: "20-45 min"
    };
    return estimates[option as keyof typeof estimates] || "Unknown";
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Choose Deployment Method
          </Heading>
          <Text
            color={tokens.colors.font.secondary}
            fontSize={tokens.fontSizes.medium}
            marginTop={tokens.space.xs}
          >
            Select how you want to deploy your document chat application
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <Alert
            variation="error"
            isDismissible={true}
            hasIcon={true}
            heading="Selection Required"
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Deployment Options */}
        <RadioGroupField
          legend="Deployment Options"
          name="deploymentOption"
          value={selectedOption}
          onChange={(e) => handleOptionChange(e.target.value)}
          legendHidden={true}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            {deploymentOptions.map((option) => {
              const isSelected = selectedOption === option.id;

              return (
                <Card
                  key={option.id}
                  variation={isSelected ? "elevated" : "outlined"}
                  padding={tokens.space.large}
                  borderRadius={tokens.radii.medium}
                  backgroundColor={
                    isSelected ? tokens.colors.blue[10] : undefined
                  }
                  borderColor={isSelected ? tokens.colors.blue[60] : undefined}
                  onClick={() => handleOptionChange(option.id)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: isSelected ? "translateY(-2px)" : "none"
                  }}
                >
                  <Flex direction="column" gap={tokens.space.medium}>
                    {/* Header Row */}
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex alignItems="center" gap={tokens.space.small}>
                        <Radio
                          value={option.id}
                          name="deploymentOption"
                          onChange={() => {}}
                        />

                        <Icon
                          ariaLabel={option.name}
                          pathData={option.icon}
                          viewBox={{ width: 24, height: 24 }}
                          fontSize={tokens.fontSizes.xl}
                          color={
                            isSelected
                              ? tokens.colors.blue[60]
                              : tokens.colors.neutral[60]
                          }
                        />

                        <View>
                          <Heading level={5} margin="0">
                            {option.name}
                          </Heading>
                          <Text
                            fontSize={tokens.fontSizes.small}
                            color={tokens.colors.font.secondary}
                          >
                            {option.description}
                          </Text>
                        </View>
                      </Flex>

                      <Flex alignItems="center" gap={tokens.space.xs}>
                        <Badge variation={option.badgeVariation} size="small">
                          {option.badge}
                        </Badge>

                        <Flex direction="column" alignItems="flex-end">
                          <Text
                            fontSize={tokens.fontSizes.xs}
                            color={getComplexityColor(option.complexity)}
                            fontWeight={tokens.fontWeights.semibold}
                          >
                            {option.complexity} Complexity
                          </Text>
                          <Text
                            fontSize={tokens.fontSizes.xs}
                            color={tokens.colors.font.secondary}
                          >
                            ~{option.timeToDeployment}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>

                    {/* Features Grid */}
                    <Grid templateColumns="1fr 1fr" gap={tokens.space.medium}>
                      <View>
                        <Text
                          fontWeight={tokens.fontWeights.semibold}
                          fontSize={tokens.fontSizes.small}
                          marginBottom={tokens.space.xs}
                        >
                          Key Features
                        </Text>
                        <Flex direction="column" gap={tokens.space.xxs}>
                          {option.features.slice(0, 3).map((feature, index) => (
                            <Flex
                              key={index}
                              alignItems="center"
                              gap={tokens.space.xs}
                            >
                              <Icon
                                ariaLabel="Check"
                                pathData="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                viewBox={{ width: 20, height: 20 }}
                                color={tokens.colors.green[60]}
                                fontSize={tokens.fontSizes.small}
                              />
                              <Text fontSize={tokens.fontSizes.xs}>
                                {feature}
                              </Text>
                            </Flex>
                          ))}
                        </Flex>
                      </View>

                      <View>
                        <Text
                          fontWeight={tokens.fontWeights.semibold}
                          fontSize={tokens.fontSizes.small}
                          marginBottom={tokens.space.xs}
                        >
                          Pros & Cons
                        </Text>
                        <Flex direction="column" gap={tokens.space.xxs}>
                          {option.pros.slice(0, 2).map((pro, index) => (
                            <Flex
                              key={index}
                              alignItems="center"
                              gap={tokens.space.xs}
                            >
                              <Text
                                fontSize={tokens.fontSizes.xs}
                                color={tokens.colors.green[70]}
                              >
                                + {pro}
                              </Text>
                            </Flex>
                          ))}
                          {option.cons.slice(0, 1).map((con, index) => (
                            <Flex
                              key={index}
                              alignItems="center"
                              gap={tokens.space.xs}
                            >
                              <Text
                                fontSize={tokens.fontSizes.xs}
                                color={tokens.colors.orange[70]}
                              >
                                - {con}
                              </Text>
                            </Flex>
                          ))}
                        </Flex>
                      </View>
                    </Grid>

                    {/* Detailed Configuration for Selected Option */}
                    {isSelected && (
                      <Card
                        backgroundColor={tokens.colors.background.secondary}
                        padding={tokens.space.medium}
                        marginTop={tokens.space.small}
                        borderRadius={tokens.radii.small}
                      >
                        {option.id === "amplify" && (
                          <Flex direction="column" gap={tokens.space.medium}>
                            <Heading level={6}>Amplify Configuration</Heading>

                            <TextField
                              label="Custom Domain (Optional)"
                              placeholder="app.yourdomain.com"
                              value={deployConfig.customDomain}
                              onChange={(e) =>
                                updateDeployConfig({
                                  customDomain: e.target.value
                                })
                              }
                              descriptiveText="Leave empty to use Amplify's generated domain"
                            />

                            <Grid
                              templateColumns="1fr 1fr 1fr"
                              gap={tokens.space.small}
                            >
                              <CheckboxField
                                label="Enable HTTPS"
                                name="enableHttps"
                                checked={deployConfig.enableHttps}
                                onChange={(e) =>
                                  updateDeployConfig({
                                    enableHttps: e.target.checked
                                  })
                                }
                              />
                              <CheckboxField
                                label="Enable CDN"
                                name="enableCdn"
                                checked={deployConfig.enableCdn}
                                onChange={(e) =>
                                  updateDeployConfig({
                                    enableCdn: e.target.checked
                                  })
                                }
                              />
                              <CheckboxField
                                label="Enable Auth"
                                name="enableAuth"
                                checked={deployConfig.enableAuth}
                                onChange={(e) =>
                                  updateDeployConfig({
                                    enableAuth: e.target.checked
                                  })
                                }
                              />
                            </Grid>

                            <Alert
                              variation="info"
                              isDismissible={false}
                              hasIcon={true}
                            >
                              <Text fontSize={tokens.fontSizes.small}>
                                Amplify will automatically handle SSL
                                certificates, scaling, and CI/CD pipeline setup.
                              </Text>
                            </Alert>
                          </Flex>
                        )}

                        {option.id === "cloudformation" && (
                          <Flex direction="column" gap={tokens.space.medium}>
                            <Heading level={6}>CloudFormation Template</Heading>

                            <Text fontSize={tokens.fontSizes.small}>
                              The generated template will include:
                            </Text>

                            <Grid
                              templateColumns="1fr 1fr"
                              gap={tokens.space.medium}
                            >
                              <View>
                                <Text
                                  fontWeight={tokens.fontWeights.semibold}
                                  fontSize={tokens.fontSizes.small}
                                >
                                  Resources Created:
                                </Text>
                                <Flex direction="column" gap={tokens.space.xxs}>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • S3 bucket for hosting
                                  </Text>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • CloudFront distribution
                                  </Text>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • IAM roles and policies
                                  </Text>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • Vector database resources
                                  </Text>
                                </Flex>
                              </View>

                              <View>
                                <Text
                                  fontWeight={tokens.fontWeights.semibold}
                                  fontSize={tokens.fontSizes.small}
                                >
                                  Parameters:
                                </Text>
                                <Flex direction="column" gap={tokens.space.xxs}>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • Environment name
                                  </Text>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • AWS region
                                  </Text>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • Domain configuration
                                  </Text>
                                  <Text fontSize={tokens.fontSizes.xs}>
                                    • Resource sizing
                                  </Text>
                                </Flex>
                              </View>
                            </Grid>

                            <Alert
                              variation="warning"
                              isDismissible={false}
                              hasIcon={true}
                            >
                              <Text fontSize={tokens.fontSizes.small}>
                                You'll need CloudFormation deployment
                                permissions in your AWS account.
                              </Text>
                            </Alert>
                          </Flex>
                        )}

                        {option.id === "cdk" && (
                          <Flex direction="column" gap={tokens.space.medium}>
                            <Heading level={6}>AWS CDK Configuration</Heading>

                            <SelectField
                              label="CDK Language"
                              value="typescript"
                              onChange={() => {}}
                            >
                              <option value="typescript">TypeScript</option>
                              <option value="python">Python</option>
                              <option value="java">Java</option>
                              <option value="csharp">C#</option>
                            </SelectField>

                            <Text fontSize={tokens.fontSizes.small}>
                              The CDK code will include:
                            </Text>

                            <Flex direction="column" gap={tokens.space.xs}>
                              <Text fontSize={tokens.fontSizes.xs}>
                                • Strongly-typed infrastructure definitions
                              </Text>
                              <Text fontSize={tokens.fontSizes.xs}>
                                • Reusable constructs and patterns
                              </Text>
                              <Text fontSize={tokens.fontSizes.xs}>
                                • Environment-specific configurations
                              </Text>
                              <Text fontSize={tokens.fontSizes.xs}>
                                • Testing framework integration
                              </Text>
                              <Text fontSize={tokens.fontSizes.xs}>
                                • CI/CD pipeline definitions
                              </Text>
                            </Flex>

                            <Alert
                              variation="info"
                              isDismissible={false}
                              hasIcon={true}
                            >
                              <Text fontSize={tokens.fontSizes.small}>
                                Requires AWS CDK CLI and Node.js/Python runtime
                                for deployment.
                              </Text>
                            </Alert>
                          </Flex>
                        )}
                      </Card>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        </RadioGroupField>

        {/* Selected Option Summary */}
        {selectedDeployment && (
          <Card
            backgroundColor={tokens.colors.green[10]}
            borderColor={tokens.colors.green[40]}
            borderWidth={tokens.borderWidths.small}
            padding={tokens.space.large}
          >
            <Flex alignItems="center" gap={tokens.space.medium}>
              <Icon
                ariaLabel="Selected"
                pathData="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M10 6.5V9H14V6.5C15.07 7.19 16 8.18 16 9.5C16 11.1 15.1 12 14 12C13.4 12 12.8 11.4 12.5 10.9C12.3 10.5 11.7 10.5 11.5 10.9C11.2 11.4 10.6 12 10 12C8.9 12 8 11.1 8 9.5C8 8.18 8.93 7.19 10 6.5Z"
                viewBox={{ width: 24, height: 24 }}
                color={tokens.colors.green[60]}
                fontSize={tokens.fontSizes.large}
              />

              <View>
                <Text
                  fontWeight={tokens.fontWeights.semibold}
                  color={tokens.colors.green[80]}
                >
                  Ready to Deploy: {selectedDeployment.name}
                </Text>
                <Text
                  fontSize={tokens.fontSizes.small}
                  color={tokens.colors.green[70]}
                >
                  Estimated deployment time:{" "}
                  <strong>{getTimeEstimate(selectedOption)}</strong>
                </Text>
              </View>
            </Flex>
          </Card>
        )}

        {/* Navigation */}
        <Flex justifyContent="space-between" marginTop={tokens.space.medium}>
          <Button onClick={onBack} variation="link" size="large">
            ← Back to Knowledge Base
          </Button>

          <Button
            type="submit"
            variation="primary"
            size="large"
            isDisabled={!selectedOption}
          >
            Continue to Summary →
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default DeploymentOptions;
