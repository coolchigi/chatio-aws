import React, { useState } from "react";
import {
  Heading,
  Text,
  Flex,
  Button,
  TextField,
  SelectField,
  useTheme,
  Alert,
  Card,
  View,
  Icon,
  Badge
} from "@aws-amplify/ui-react";

interface ProjectSetupProps {
  config: {
    name: string;
    region: string;
  };
  updateConfig: (updates: Partial<{ name: string; region: string }>) => void;
  onNext: () => void;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({
  config,
  updateConfig,
  onNext
}) => {
  const { tokens } = useTheme();
  const [error, setError] = useState("");
  const [isValidated, setIsValidated] = useState(false);

  const regions = [
    {
      id: "us-east-1",
      name: "US East (N. Virginia)",
      description: "Primary AWS region",
      badge: "Recommended"
    },
    {
      id: "us-east-2",
      name: "US East (Ohio)",
      description: "Lower latency for East Coast"
    },
    {
      id: "us-west-1",
      name: "US West (N. California)",
      description: "West Coast coverage"
    },
    {
      id: "us-west-2",
      name: "US West (Oregon)",
      description: "Popular for startups"
    },
    {
      id: "eu-west-1",
      name: "EU (Ireland)",
      description: "European data compliance"
    },
    {
      id: "eu-central-1",
      name: "EU (Frankfurt)",
      description: "Central European hub"
    },
    {
      id: "ap-northeast-1",
      name: "Asia Pacific (Tokyo)",
      description: "Asian market coverage"
    },
    {
      id: "ap-southeast-1",
      name: "Asia Pacific (Singapore)",
      description: "Southeast Asian hub"
    }
  ];

  const validateProjectName = (name: string) => {
    if (!name) return "Please enter a project name";
    if (name.length < 3) return "Project name must be at least 3 characters";
    if (name.length > 50) return "Project name must be less than 50 characters";
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      return "Project name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    return "";
  };

  const handleProjectNameChange = (value: string) => {
    updateConfig({ name: value });

    const validationError = validateProjectName(value);
    if (validationError) {
      setError(validationError);
      setIsValidated(false);
    } else {
      setError("");
      setIsValidated(true);
    }
  };

  const handleRegionChange = (value: string) => {
    updateConfig({ region: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateProjectName(config.name);
    if (validationError) {
      setError(validationError);
      return;
    }

    onNext();
  };

  const selectedRegion = regions.find((r) => r.id === config.region);

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header Section */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Project Setup
          </Heading>
          <Text
            color={tokens.colors.font.secondary}
            fontSize={tokens.fontSizes.medium}
            marginTop={tokens.space.xs}
          >
            Let's start by configuring your project basics
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <Alert
            variation="error"
            isDismissible={true}
            hasIcon={true}
            heading="Validation Error"
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Form Fields Card */}
        <Card
          variation="outlined"
          padding={tokens.space.large}
          borderRadius={tokens.radii.medium}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            {/* Project Name Field */}
            <View>
              <TextField
                label="Project Name"
                placeholder="My Document Chat App"
                value={config.name}
                onChange={(e) => handleProjectNameChange(e.target.value)}
                isRequired={true}
                descriptiveText="Give your project a descriptive name (3-50 characters)"
                hasError={!!error}
                size="large"
                innerEndComponent={
                  isValidated && !error ? (
                    <Icon
                      ariaLabel="Valid"
                      color={tokens.colors.green[60]}
                      viewBox={{ width: 20, height: 20 }}
                      pathData="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  ) : null
                }
              />

              {config.name && !error && (
                <Text
                  fontSize={tokens.fontSizes.small}
                  color={tokens.colors.green[60]}
                  marginTop={tokens.space.xs}
                >
                  ✓ Project name looks good!
                </Text>
              )}
            </View>

            {/* AWS Region Selection */}
            <View>
              <SelectField
                label="AWS Region"
                value={config.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                descriptiveText="Choose the AWS region closest to your users for optimal performance"
                size="large"
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </SelectField>

              {/* Region Info Card */}
              {selectedRegion && (
                <Card
                  variation="outlined"
                  marginTop={tokens.space.small}
                  padding={tokens.space.medium}
                  backgroundColor={tokens.colors.background.secondary}
                >
                  <Flex alignItems="center" gap={tokens.space.small}>
                    <View flex="1">
                      <Flex alignItems="center" gap={tokens.space.xs}>
                        <Text fontWeight={tokens.fontWeights.semibold}>
                          {selectedRegion.name}
                        </Text>
                        {selectedRegion.badge && (
                          <Badge variation="success" size="small">
                            {selectedRegion.badge}
                          </Badge>
                        )}
                      </Flex>
                      <Text
                        fontSize={tokens.fontSizes.small}
                        color={tokens.colors.font.secondary}
                      >
                        {selectedRegion.description}
                      </Text>
                    </View>
                  </Flex>
                </Card>
              )}
            </View>
          </Flex>
        </Card>

        {/* Info Section */}
        <Card
          backgroundColor={tokens.colors.blue[10]}
          borderColor={tokens.colors.blue[40]}
          borderWidth={tokens.borderWidths.small}
          padding={tokens.space.medium}
          borderRadius={tokens.radii.medium}
        >
          <Flex alignItems="flex-start" gap={tokens.space.small}>
            <Icon
              ariaLabel="Info"
              color={tokens.colors.blue[60]}
              viewBox={{ width: 20, height: 20 }}
              pathData="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              marginTop={tokens.space.xxs}
            />
            <View>
              <Text
                fontWeight={tokens.fontWeights.semibold}
                color={tokens.colors.blue[80]}
                fontSize={tokens.fontSizes.small}
              >
                Next Steps Preview
              </Text>
              <Text
                fontSize={tokens.fontSizes.small}
                color={tokens.colors.blue[70]}
                marginTop={tokens.space.xxs}
              >
                After this step, you'll select a
                vector database, choose an AI model, and set up your knowledge
                base.
              </Text>
            </View>
          </Flex>
        </Card>

        {/* Navigation */}
        <Flex justifyContent="flex-end" marginTop={tokens.space.medium}>
          <Button
            type="submit"
            variation="primary"
            size="large"
            isDisabled={!config.name || !!error}
            backgroundColor={
              isValidated ? tokens.colors.primary[60] : undefined
            }
          >
            Continue to Vector Database →
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default ProjectSetup;
