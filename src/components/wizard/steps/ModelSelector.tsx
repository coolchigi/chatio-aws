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
  SliderField,
  SwitchField,
  Accordion
} from "@aws-amplify/ui-react";
import { bedrockModelOptions } from "../../../config/aws-config";

interface ModelSelectorProps {
  config: {
    name: string;
    region: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  updateConfig: (updates: Partial<{ modelId: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const { tokens } = useTheme();
  const [selectedModel, setSelectedModel] = useState(config.modelId || "");
  const [error, setError] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [estimatedTokensPerMonth, setEstimatedTokensPerMonth] =
    useState(100000);
  const [inputOutputRatio, setInputOutputRatio] = useState(0.2); // 20% input, 80% output

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    updateConfig({ modelId: value });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModel) {
      setError("Please select an AI model");
      return;
    }
    onNext();
  };

  const selectedModelDetails = bedrockModelOptions.find(
    (model) => model.id === selectedModel
  );

  const getModelBadge = (modelId: string) => {
    if (modelId.includes("claude-3")) {
      return (
        <Badge variation="success" size="small">
          Latest
        </Badge>
      );
    } else if (modelId.includes("claude-v2")) {
      return (
        <Badge variation="info" size="small">
          Stable
        </Badge>
      );
    } else if (modelId.includes("titan")) {
      return (
        <Badge variation="warning" size="small">
          Embedding
        </Badge>
      );
    }
    return null;
  };

  const getPerformanceScore = (modelId: string) => {
    const scores = {
      "anthropic.claude-3-sonnet-20240229-v1:0": 95,
      "anthropic.claude-v2": 85,
      "anthropic.claude-3-haiku-20240307-v1:0": 90,
      "amazon.titan-embed-text-v1": 80
    };
    return scores[modelId as keyof typeof scores] || 75;
  };

  const estimateMonthlyCost = (modelId: string) => {
    const model = bedrockModelOptions.find((m) => m.id === modelId);
    if (!model || model.pricing === "N/A (embedding model)") return 0;

    // Extract pricing from the pricing string
    const inputMatch = model.pricing.match(
      /\$(\d+(?:\.\d+)?) per 1M input tokens/
    );
    const outputMatch = model.pricing.match(
      /\$(\d+(?:\.\d+)?) per 1M output tokens/
    );

    if (!inputMatch || !outputMatch) return 0;

    const inputPrice = parseFloat(inputMatch[1]);
    const outputPrice = parseFloat(outputMatch[1]);

    const inputTokens = estimatedTokensPerMonth * inputOutputRatio;
    const outputTokens = estimatedTokensPerMonth * (1 - inputOutputRatio);

    const inputCost = (inputTokens / 1000000) * inputPrice;
    const outputCost = (outputTokens / 1000000) * outputPrice;

    return Math.round((inputCost + outputCost) * 100) / 100;
  };

  const getRecommendationReason = (modelId: string) => {
    switch (modelId) {
      case "anthropic.claude-3-sonnet-20240229-v1:0":
        return "Best balance of performance and cost for most applications";
      case "anthropic.claude-3-haiku-20240307-v1:0":
        return "Fastest responses with lowest cost for simple queries";
      case "anthropic.claude-v2":
        return "Proven stability with excellent reasoning capabilities";
      case "amazon.titan-embed-text-v1":
        return "Optimized for text embeddings and semantic search";
      default:
        return "Reliable option for document chat applications";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Select AI Model
          </Heading>
          <Text
            color={tokens.colors.font.secondary}
            fontSize={tokens.fontSizes.medium}
            marginTop={tokens.space.xs}
          >
            Choose the perfect AI model for your document chat application
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
              <Heading level={5}>Estimate Your Token Usage</Heading>
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
                label={`Monthly Tokens: ${estimatedTokensPerMonth.toLocaleString()}`}
                min={10000}
                max={10000000}
                step={10000}
                value={estimatedTokensPerMonth}
                onChange={(value) => setEstimatedTokensPerMonth(value)}
              />

              <SliderField
                label={`Input Ratio: ${Math.round(inputOutputRatio * 100)}%`}
                min={0.1}
                max={0.9}
                step={0.1}
                value={inputOutputRatio}
                onChange={(value) => setInputOutputRatio(value)}
              />
            </Grid>

            <Text
              fontSize={tokens.fontSizes.small}
              color={tokens.colors.font.secondary}
            >
              Input tokens are your questions and document context. Output
              tokens are AI responses.
            </Text>
          </Flex>
        </Card>

        {/* Model Selection */}
        <RadioGroupField
          legend="AI Model Options"
          name="aiModel"
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          legendHidden={true}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            {bedrockModelOptions.map((model) => {
              const isSelected = selectedModel === model.id;
              const performanceScore = getPerformanceScore(model.id);
              const estimatedCost = estimateMonthlyCost(model.id);
              const isEmbeddingModel =
                model.contextWindow === "N/A (embedding model)";

              return (
                <Card
                  key={model.id}
                  variation={isSelected ? "elevated" : "outlined"}
                  padding={tokens.space.medium}
                  borderRadius={tokens.radii.medium}
                  backgroundColor={
                    isSelected ? tokens.colors.blue[10] : undefined
                  }
                  borderColor={isSelected ? tokens.colors.blue[60] : undefined}
                  onClick={() =>
                    !isEmbeddingModel && handleModelChange(model.id)
                  }
                  style={{
                    cursor: isEmbeddingModel ? "not-allowed" : "pointer",
                    opacity: isEmbeddingModel ? 0.6 : 1,
                    transition: "all 0.2s ease",
                    transform: isSelected ? "translateY(-2px)" : "none"
                  }}
                >
                  <Flex direction="column" gap={tokens.space.small}>
                    {/* Header Row */}
                    <Flex alignItems="center" justifyContent="space-between">
                      <Flex alignItems="center" gap={tokens.space.small}>
                        <Radio
                          value={model.id}
                          name="aiModel"
                          onChange={() => {}}
                          isDisabled={isEmbeddingModel}
                        />
                        <Heading level={5} margin="0">
                          {model.name}
                        </Heading>
                        <Badge variation="info" size="small">
                          {model.provider}
                        </Badge>
                        {getModelBadge(model.id)}
                      </Flex>

                      <Flex alignItems="center" gap={tokens.space.xs}>
                        {!isEmbeddingModel && (
                          <>
                            {/* Performance Score */}
                            <Badge
                              variation={
                                performanceScore >= 90
                                  ? "success"
                                  : performanceScore >= 80
                                  ? "info"
                                  : "warning"
                              }
                              size="small"
                            >
                              {performanceScore}% Match
                            </Badge>

                            {/* Estimated Cost */}
                            <Text
                              fontSize={tokens.fontSizes.small}
                              fontWeight={tokens.fontWeights.semibold}
                              color={tokens.colors.green[70]}
                            >
                              ~${estimatedCost}/mo
                            </Text>
                          </>
                        )}
                      </Flex>
                    </Flex>

                    {/* Model Details */}
                    <Flex
                      alignItems="center"
                      gap={tokens.space.medium}
                      marginLeft="1.5rem"
                    >
                      <Flex alignItems="center" gap={tokens.space.xs}>
                        <Icon
                          ariaLabel="Context"
                          pathData="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M21 9V7L15 7.5V9.5L21 9M15 10.5V12.5L21 12V10L15 10.5M15 13.5V15.5L21 15V13L15 13.5Z"
                          viewBox={{ width: 24, height: 24 }}
                          fontSize={tokens.fontSizes.small}
                          color={tokens.colors.neutral[60]}
                        />
                        <Text
                          fontSize={tokens.fontSizes.xs}
                          color={tokens.colors.neutral[60]}
                        >
                          Context: {model.contextWindow}
                        </Text>
                      </Flex>

                      <Text
                        fontSize={tokens.fontSizes.xs}
                        color={tokens.colors.font.secondary}
                      >
                        {model.pricing}
                      </Text>
                    </Flex>

                    {/* Recommendation Reason */}
                    <Text
                      fontSize={tokens.fontSizes.small}
                      marginLeft="1.5rem"
                      color={tokens.colors.font.secondary}
                      fontStyle="italic"
                    >
                      {getRecommendationReason(model.id)}
                    </Text>

                    {/* Detailed Information for Selected */}
                    {isSelected && !isEmbeddingModel && (
                      <Card
                        backgroundColor={tokens.colors.background.secondary}
                        padding={tokens.space.medium}
                        marginTop={tokens.space.small}
                        borderRadius={tokens.radii.small}
                      >
                        <Accordion
                          items={[
                            {
                              trigger: "Model Capabilities & Use Cases",
                              value: `${model.id}-details`,
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
                                        Best For
                                      </Text>
                                      <Text fontSize={tokens.fontSizes.xs}>
                                        {model.id.includes("claude-3-sonnet") &&
                                          "Complex document analysis, detailed Q&A, multi-step reasoning"}
                                        {model.id.includes("claude-3-haiku") &&
                                          "Quick responses, simple questions, high-volume applications"}
                                        {model.id.includes("claude-v2") &&
                                          "Balanced performance, proven reliability, general purpose"}
                                      </Text>
                                    </View>

                                    <View>
                                      <Text
                                        fontWeight={tokens.fontWeights.semibold}
                                        fontSize={tokens.fontSizes.small}
                                        marginBottom={tokens.space.xs}
                                      >
                                        Response Style
                                      </Text>
                                      <Text fontSize={tokens.fontSizes.xs}>
                                        {model.id.includes("claude-3-sonnet") &&
                                          "Detailed, nuanced responses with excellent reasoning"}
                                        {model.id.includes("claude-3-haiku") &&
                                          "Concise, fast responses optimized for efficiency"}
                                        {model.id.includes("claude-v2") &&
                                          "Thoughtful, well-structured responses"}
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
                                        templateColumns="repeat(4, 1fr)"
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
                                            <strong>Speed</strong>
                                            <br />
                                            {model.id.includes("haiku")
                                              ? "Excellent"
                                              : model.id.includes("sonnet")
                                              ? "Good"
                                              : "Very Good"}
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
                                            <strong>Accuracy</strong>
                                            <br />
                                            {model.id.includes("sonnet")
                                              ? "Excellent"
                                              : model.id.includes("claude-v2")
                                              ? "Excellent"
                                              : "Very Good"}
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
                                            <strong>Cost</strong>
                                            <br />
                                            {model.id.includes("haiku")
                                              ? "Excellent"
                                              : model.id.includes("sonnet")
                                              ? "Good"
                                              : "Fair"}
                                          </Text>
                                        </Card>
                                        <Card
                                          padding={tokens.space.small}
                                          backgroundColor={
                                            tokens.colors.purple[10]
                                          }
                                        >
                                          <Text
                                            fontSize={tokens.fontSizes.xs}
                                            textAlign="center"
                                          >
                                            <strong>Context</strong>
                                            <br />
                                            {model.id.includes("claude-3")
                                              ? "200K"
                                              : "100K"}
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

                    {/* Embedding Model Notice */}
                    {isEmbeddingModel && (
                      <Alert
                        variation="info"
                        isDismissible={false}
                        hasIcon={true}
                        fontSize={tokens.fontSizes.small}
                      >
                        This model is for text embeddings only, not for chat
                        responses.
                      </Alert>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </Flex>
        </RadioGroupField>

        {/* Selected Model Summary */}
        {selectedModelDetails && (
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
                  Excellent Choice: {selectedModelDetails.name}
                </Text>
                <Text
                  fontSize={tokens.fontSizes.small}
                  color={tokens.colors.green[70]}
                >
                  Estimated monthly cost:{" "}
                  <strong>${estimateMonthlyCost(selectedModel)}</strong> for
                  your usage pattern
                </Text>
              </View>
            </Flex>
          </Card>
        )}

        {/* Navigation */}
        <Flex justifyContent="space-between" marginTop={tokens.space.medium}>
          <Button onClick={onBack} variation="link" size="large">
            ← Back to Vector Database
          </Button>

          <Button
            type="submit"
            variation="primary"
            size="large"
            isDisabled={
              !selectedModel ||
              selectedModelDetails?.contextWindow === "N/A (embedding model)"
            }
          >
            Continue to Knowledge Base →
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default ModelSelector;
