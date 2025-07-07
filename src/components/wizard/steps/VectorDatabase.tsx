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
  Accordion,
  Link,
  Grid,
  Icon,
  SliderField,
  SwitchField
} from "@aws-amplify/ui-react";
import { vectorDatabaseOptions } from "../../../config/aws-config";

interface VectorDatabaseProps {
  config: {
    name: string;
    region: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  updateConfig: (updates: Partial<{ vectorDatabaseId: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const VectorDatabase: React.FC<VectorDatabaseProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const { tokens } = useTheme();
  const [selectedDb, setSelectedDb] = useState(config.vectorDatabaseId || "");
  const [error, setError] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [estimatedDocuments, setEstimatedDocuments] = useState(1000);
  const [estimatedQueries, setEstimatedQueries] = useState(10000);

  const handleDatabaseChange = (value: string) => {
    setSelectedDb(value);
    updateConfig({ vectorDatabaseId: value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDb) {
      setError("Please select a vector database");
      return;
    }
    onNext();
  };

  const selectedDatabase = vectorDatabaseOptions.find(
    (db) => db.id === selectedDb
  );

  const getProviderBadge = (dbId: string) => {
    const isAWSNative = ["opensearch", "aurora", "dynamodb", "kendra"].includes(
      dbId
    );
    return isAWSNative ? (
      <Badge variation="success" size="small">
        AWS Native
      </Badge>
    ) : (
      <Badge variation="warning" size="small">
        Third Party
      </Badge>
    );
  };

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

  const getRecommendationScore = (dbId: string) => {
    const scores = {
      opensearch: 95,
      aurora: 85,
      pinecone: 90,
      dynamodb: 80,
      kendra: 75
    };
    return scores[dbId as keyof typeof scores] || 70;
  };

  const estimateMonthlyCost = (dbId: string) => {
    const baseCosts = {
      opensearch: 72, // ~$0.10/hour * 24 * 30
      aurora: 75,
      pinecone: 70,
      dynamodb: 25,
      kendra: 540 // ~$0.75/hour * 24 * 30
    };

    const documentMultiplier = Math.log10(estimatedDocuments) / 3;
    const queryMultiplier = Math.log10(estimatedQueries) / 4;

    return Math.round(
      (baseCosts[dbId as keyof typeof baseCosts] || 50) *
        (1 + documentMultiplier + queryMultiplier)
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Select Vector Database
          </Heading>
          <Text
            color={tokens.colors.font.secondary}
            fontSize={tokens.fontSizes.medium}
            marginTop={tokens.space.xs}
          >
            Choose the perfect vector database for your knowledge base
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

        {/* Usage Estimation */}
        <Card
          variation="outlined"
          padding={tokens.space.large}
          backgroundColor={tokens.colors.blue[10]}
          borderColor={tokens.colors.blue[40]}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            <Flex alignItems="center" gap={tokens.space.small}>
              <Icon
                ariaLabel="Calculator"
                pathData="M7 2C5.9 2 5 2.9 5 4V20C5 21.1 5.9 22 7 22H17C18.1 22 19 21.1 19 20V4C19 2.9 18.1 2 17 2H7M7 4H17V6H7V4M7 8H17V10H7V8M7 12H17V14H7V12M7 16H17V18H7V16Z"
                viewBox={{ width: 24, height: 24 }}
                color={tokens.colors.blue[60]}
              />
              <Heading level={5}>Estimate Your Usage</Heading>
              <SwitchField
                label="Show detailed comparison"
                labelPosition="start"
                size="small"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
              />
            </Flex>

            <Grid templateColumns="1fr 1fr" gap={tokens.space.medium}>
              <SliderField
                label={`Documents: ${estimatedDocuments.toLocaleString()}`}
                min={100}
                max={100000}
                step={100}
                value={estimatedDocuments}
                onChange={(value) => setEstimatedDocuments(value)}
              />

              <SliderField
                label={`Queries/month: ${estimatedQueries.toLocaleString()}`}
                min={1000}
                max={1000000}
                step={1000}
                value={estimatedQueries}
                onChange={(value) => setEstimatedQueries(value)}
              />
            </Grid>
          </Flex>
        </Card>

        {/* Vector Database Options */}
        <RadioGroupField
          legend="Vector Database Options"
          name="vectorDatabase"
          value={selectedDb}
          onChange={(e) => handleDatabaseChange(e.target.value)}
          legendHidden={true}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            {vectorDatabaseOptions.map((db) => {
              const isSelected = selectedDb === db.id;
              const recommendationScore = getRecommendationScore(db.id);
              const estimatedCost = estimateMonthlyCost(db.id);

              return (
                <Card
                  key={db.id}
                  variation={isSelected ? "elevated" : "outlined"}
                  padding={tokens.space.medium}
                  borderRadius={tokens.radii.medium}
                  backgroundColor={
                    isSelected ? tokens.colors.blue[10] : undefined
                  }
                  borderColor={isSelected ? tokens.colors.blue[60] : undefined}
                  onClick={() => handleDatabaseChange(db.id)}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: isSelected ? "translateY(-2px)" : "none"
                  }}
                >
                  <Flex direction="column" gap={tokens.space.small}>
                    {/* Header Row */}
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex alignItems="center" gap={tokens.space.small}>
                        <Radio
                          value={db.id}
                          name="vectorDatabase"
                          onChange={() => {}}
                        />
                        <Heading level={5} margin="0">
                          {db.name}
                        </Heading>
                        {getProviderBadge(db.id)}
                      </Flex>

                      <Flex alignItems="center" gap={tokens.space.xs}>
                        {/* Recommendation Score */}
                        <Badge
                          variation={
                            recommendationScore >= 90
                              ? "success"
                              : recommendationScore >= 80
                              ? "info"
                              : "warning"
                          }
                          size="small"
                        >
                          {recommendationScore}% Match
                        </Badge>

                        {/* Estimated Cost */}
                        <Text
                          fontSize={tokens.fontSizes.small}
                          fontWeight={tokens.fontWeights.semibold}
                          color={tokens.colors.green[70]}
                        >
                          ~${estimatedCost}/mo
                        </Text>
                      </Flex>
                    </Flex>

                    {/* Description */}
                    <Text fontSize={tokens.fontSizes.small} marginLeft="1.5rem">
                      {db.description}
                    </Text>

                    {/* Key Features */}
                    <Flex
                      alignItems="center"
                      gap={tokens.space.medium}
                      marginLeft="1.5rem"
                      marginTop={tokens.space.xs}
                    >
                      <Flex alignItems="center" gap={tokens.space.xs}>
                        <Icon
                          ariaLabel="Complexity"
                          pathData="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 7.5V9.5L21 9M15 10.5V12.5L21 12V10L15 10.5M15 13.5V15.5L21 15V13L15 13.5M12 7.5C15.04 7.5 17.5 9.96 17.5 13S15.04 18.5 12 18.5 6.5 16.04 6.5 13 8.96 7.5 12 7.5M12 9C10.07 9 8.5 10.57 8.5 12.5S10.07 16 12 16 15.5 14.43 15.5 12.5 13.93 9 12 9Z"
                          viewBox={{ width: 24, height: 24 }}
                          fontSize={tokens.fontSizes.small}
                          color={getComplexityColor(db.setupComplexity)}
                        />
                        <Text
                          fontSize={tokens.fontSizes.xs}
                          color={getComplexityColor(db.setupComplexity)}
                        >
                          {db.setupComplexity} Setup
                        </Text>
                      </Flex>

                      <Link
                        href={db.pricingDetails}
                        isExternal={true}
                        fontSize={tokens.fontSizes.xs}
                        color={tokens.colors.blue[70]}
                      >
                        View Pricing Details
                      </Link>
                    </Flex>

                    {/* Detailed Information for Selected */}
                    {isSelected && (
                      <Card
                        backgroundColor={tokens.colors.background.secondary}
                        padding={tokens.space.medium}
                        marginTop={tokens.space.small}
                        borderRadius={tokens.radii.small}
                      >
                        <Accordion
                          items={[
                            {
                              trigger: "Detailed Information & Configuration",
                              value: `${db.id}-details`,
                              content: (
                                <Flex
                                  direction="column"
                                  gap={tokens.space.medium}
                                >
                                  <Grid
                                    templateColumns="1fr 1fr"
                                    gap={tokens.space.medium}
                                  >
                                    <View>
                                      <Text
                                        fontWeight={tokens.fontWeights.semibold}
                                        fontSize={tokens.fontSizes.small}
                                        marginBottom={tokens.space.xs}
                                      >
                                        Pricing Structure
                                      </Text>
                                      <Text fontSize={tokens.fontSizes.xs}>
                                        {db.pricing}
                                      </Text>
                                    </View>

                                    <View>
                                      <Text
                                        fontWeight={tokens.fontWeights.semibold}
                                        fontSize={tokens.fontSizes.small}
                                        marginBottom={tokens.space.xs}
                                      >
                                        Best For
                                      </Text>
                                      <Text fontSize={tokens.fontSizes.xs}>
                                        {db.id === "opensearch" &&
                                          "Large-scale search applications with complex queries"}
                                        {db.id === "pinecone" &&
                                          "Real-time applications requiring fast vector searches"}
                                        {db.id === "aurora" &&
                                          "Applications needing both relational and vector data"}
                                        {db.id === "dynamodb" &&
                                          "Serverless applications with predictable access patterns"}
                                        {db.id === "kendra" &&
                                          "Enterprise search with natural language queries"}
                                      </Text>
                                    </View>
                                  </Grid>

                                  {showComparison && (
                                    <View>
                                      <Text
                                        fontWeight={tokens.fontWeights.semibold}
                                        fontSize={tokens.fontSizes.small}
                                        marginBottom={tokens.space.xs}
                                      >
                                        Performance Characteristics
                                      </Text>
                                      <Grid
                                        templateColumns="repeat(3, 1fr)"
                                        gap={tokens.space.small}
                                      >
                                        <Card
                                          padding={tokens.space.small}
                                          backgroundColor={
                                            tokens.colors.green[10]
                                          }
                                        >
                                          <Text
                                            fontSize={tokens.fontSizes.xs}
                                            textAlign="center"
                                          >
                                            <strong>Query Speed</strong>
                                            <br />
                                            {db.id === "pinecone"
                                              ? "Excellent"
                                              : db.id === "opensearch"
                                              ? "Very Good"
                                              : db.id === "aurora"
                                              ? "Good"
                                              : "Good"}
                                          </Text>
                                        </Card>
                                        <Card
                                          padding={tokens.space.small}
                                          backgroundColor={
                                            tokens.colors.blue[10]
                                          }
                                        >
                                          <Text
                                            fontSize={tokens.fontSizes.xs}
                                            textAlign="center"
                                          >
                                            <strong>Scalability</strong>
                                            <br />
                                            {db.id === "dynamodb"
                                              ? "Excellent"
                                              : db.id === "opensearch"
                                              ? "Excellent"
                                              : db.id === "pinecone"
                                              ? "Very Good"
                                              : "Good"}
                                          </Text>
                                        </Card>
                                        <Card
                                          padding={tokens.space.small}
                                          backgroundColor={
                                            tokens.colors.orange[10]
                                          }
                                        >
                                          <Text
                                            fontSize={tokens.fontSizes.xs}
                                            textAlign="center"
                                          >
                                            <strong>Cost Efficiency</strong>
                                            <br />
                                            {db.id === "dynamodb"
                                              ? "Excellent"
                                              : db.id === "pinecone"
                                              ? "Good"
                                              : db.id === "aurora"
                                              ? "Good"
                                              : "Fair"}
                                          </Text>
                                        </Card>
                                      </Grid>
                                    </View>
                                  )}
                                </Flex>
                              )
                            }
                          ]}
                        />
                      </Card>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        </RadioGroupField>

        {/* Selected Database Summary */}
        {selectedDatabase && (
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
                  Perfect Choice: {selectedDatabase.name}
                </Text>
                <Text
                  fontSize={tokens.fontSizes.small}
                  color={tokens.colors.green[70]}
                >
                  Estimated monthly cost:{" "}
                  <strong>${estimateMonthlyCost(selectedDb)}</strong> for your
                  usage pattern
                </Text>
              </View>
            </Flex>
          </Card>
        )}

        {/* Navigation */}
        <Flex justifyContent="space-between" marginTop={tokens.space.medium}>
          <Button onClick={onBack} variation="link" size="large">
            ← Back to Project Setup
          </Button>

          <Button
            type="submit"
            variation="primary"
            size="large"
            isDisabled={!selectedDb}
          >
            Continue to Model Selection →
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default VectorDatabase;
