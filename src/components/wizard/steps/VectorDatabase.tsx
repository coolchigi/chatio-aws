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
import { calculateOpenSearchCost } from '../../../cost/costCalculators';
import { OPENSEARCH_PRICING } from '../../../cost/pricingData';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import {
  setVectorDb,
  setStorageGB,
  setEstimatedDocuments,
  setEstimatedQueries
} from '../../../store/costSlice';

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
  const dispatch = useDispatch();
  // Use Redux state for all cost-related values
  const selectedDb = useSelector((state: RootState) => state.cost.vectorDb);
  const storageGB = useSelector((state: RootState) => state.cost.storageGB);
  const estimatedDocuments = useSelector((state: RootState) => state.cost.estimatedDocuments);
  const estimatedQueries = useSelector((state: RootState) => state.cost.estimatedQueries);
  const [error, setError] = useState("");
  const [showComparison, setShowComparison] = useState(false);

  const handleDatabaseChange = (value: string) => {
    dispatch(setVectorDb(value));
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

  const getDbMonthlyCost = (dbId: string, storageGB: number, docCount: number, queryCount: number) => {
    if (dbId === 'opensearch') {
      const result = calculateOpenSearchCost({ storageGB });
      return Math.round(result.total);
    } else if (dbId === 'opensearch-serverless') {
      const result = calculateOpenSearchCost({ storageGB, serverless: true });
      return Math.round(result.total);
    } else {
      // Fallback for other DBs (mimic CostEstimator logic)
      const avgDocSizeMB = 2;
      const totalStorageGB = (docCount * avgDocSizeMB) / 1024;
      let storageCost = 0;
      switch (dbId) {
        case 'aurora':
          storageCost = totalStorageGB * 0.10;
          break;
        case 'dynamodb':
          storageCost = totalStorageGB * 0.25;
          break;
        case 'kendra':
          storageCost = docCount * 0.00025;
          break;
        case 'pinecone':
          storageCost = totalStorageGB * 0.20;
          break;
        default:
          storageCost = totalStorageGB * 0.15;
      }
      return Math.round(storageCost);
    }
  };

  const usageEstimated = estimatedDocuments > 0 && estimatedQueries > 0;

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
              const estimatedCost = getDbMonthlyCost(db.id, storageGB, estimatedDocuments, estimatedQueries);

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
                  onClick={() => usageEstimated && handleDatabaseChange(db.id)}
                  style={{
                    cursor: usageEstimated ? "pointer" : "not-allowed",
                    opacity: usageEstimated ? 1 : 0.5,
                    transition: "all 0.2s ease",
                    transform: isSelected ? "translateY(-2px)" : "none"
                  }}
                >
                  <Flex direction="column" gap={tokens.space.small}>
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex alignItems="center" gap={tokens.space.small}>
                        <Radio
                          value={db.id}
                          name="vectorDatabase"
                          onChange={() => {}}
                          disabled={!usageEstimated}
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
                                      {db.id === 'opensearch' && (
                                        <Text fontSize={tokens.fontSizes.xs}>
                                          Example: t3.small.search (2 vCPU, 2 GiB RAM) starts at $0.036/hr in us-east-1. Pricing is based on instance type, node count, and storage. <Link href="https://aws.amazon.com/opensearch-service/pricing/" isExternal>See AWS OpenSearch Pricing</Link> for details.
                                        </Text>
                                      )}
                                      {db.id === 'aurora' && (
                                        <Text fontSize={tokens.fontSizes.xs}>
                                          Example: db.t3.medium (2 vCPU, 4 GiB RAM) starts at $0.067/hr. Storage: $0.10/GB-month. <Link href="https://aws.amazon.com/rds/aurora/pricing/" isExternal>See Aurora Pricing</Link> for details.
                                        </Text>
                                      )}
                                      {db.id === 'dynamodb' && (
                                        <Text fontSize={tokens.fontSizes.xs}>
                                          Pricing is based on read/write capacity and storage. Example: 25 GB storage and 200M write/200M read requests = ~$1.25/mo. <Link href="https://aws.amazon.com/dynamodb/pricing/" isExternal>See DynamoDB Pricing</Link> for details.
                                        </Text>
                                      )}
                                      {db.id === 'kendra' && (
                                        <Text fontSize={tokens.fontSizes.xs}>
                                          Starts at $810/month for the Developer Edition. <Link href="https://aws.amazon.com/kendra/pricing/" isExternal>See Kendra Pricing</Link> for details.
                                        </Text>
                                      )}
                                      {db.id === 'pinecone' && (
                                        <Text fontSize={tokens.fontSizes.xs}>
                                          Starter plan: $0.096/hr for 1 pod (1 vCPU, 4GB RAM). <Link href="https://www.pinecone.io/pricing/" isExternal>See Pinecone Pricing</Link> for details.
                                        </Text>
                                      )}
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
                  <strong>${getDbMonthlyCost(selectedDb, storageGB, estimatedDocuments, estimatedQueries)}</strong> for your usage pattern
                </Text>
                {/* Documentation links */}
                <div style={{ fontSize: '0.8em', marginTop: 4 }}>
                  <a href={OPENSEARCH_PRICING.docs.main} target="_blank" rel="noopener noreferrer">AWS OpenSearch Pricing</a> |{' '}
                  <a href={OPENSEARCH_PRICING.docs.instance} target="_blank" rel="noopener noreferrer">Instance Pricing</a> |{' '}
                  <a href={OPENSEARCH_PRICING.docs.calculator} target="_blank" rel="noopener noreferrer">AWS Calculator</a>
                </div>
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
