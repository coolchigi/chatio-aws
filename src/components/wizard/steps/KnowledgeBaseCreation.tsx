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
  TextField,
  TextAreaField,
  Grid,
  SliderField,
  SwitchField,
  Loader,
  CheckboxField,
  SelectField
} from "@aws-amplify/ui-react";
import {
  vectorDatabaseOptions,
  bedrockModelOptions
} from "../../../config/aws-config";
import CostEstimator from "../../cost-optimizer/CostEstimator";

interface KnowledgeBaseCreationProps {
  config: {
    name: string;
    region: string;
    s3Bucket: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  updateConfig: (updates: Partial<{ knowledgeBaseId: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface KnowledgeBaseConfig {
  name: string;
  description: string;
  chunkSize: number;
  chunkOverlap: number;
  enableMetadata: boolean;
  indexingStrategy: string;
  embeddingModel: string;
  estimatedDocuments: number;
  estimatedQueries: number;
}

const KnowledgeBaseCreation: React.FC<KnowledgeBaseCreationProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const { tokens } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationStep, setCreationStep] = useState("");
  const [error, setError] = useState("");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showCostPanel, setShowCostPanel] = useState(true);

  const [kbConfig, setKbConfig] = useState<KnowledgeBaseConfig>({
    name: `${config.name} Knowledge Base`,
    description: `Knowledge base for ${config.name} document chat application`,
    chunkSize: 1000,
    chunkOverlap: 200,
    enableMetadata: true,
    indexingStrategy: "hierarchical",
    embeddingModel: "amazon.titan-embed-text-v1",
    estimatedDocuments: 100,
    estimatedQueries: 1000
  });

  const selectedVectorDb = vectorDatabaseOptions.find(
    (db) => db.id === config.vectorDatabaseId
  );
  const selectedModel = bedrockModelOptions.find(
    (model) => model.id === config.modelId
  );

  const updateKbConfig = (updates: Partial<KnowledgeBaseConfig>) => {
    setKbConfig((prev) => ({ ...prev, ...updates }));
  };

  const validateConfiguration = () => {
    if (!kbConfig.name.trim()) {
      setError("Knowledge base name is required");
      return false;
    }
    if (kbConfig.name.length < 3) {
      setError("Knowledge base name must be at least 3 characters");
      return false;
    }
    if (kbConfig.chunkSize < 100 || kbConfig.chunkSize > 8000) {
      setError("Chunk size must be between 100 and 8000 characters");
      return false;
    }
    if (kbConfig.chunkOverlap >= kbConfig.chunkSize) {
      setError("Chunk overlap must be less than chunk size");
      return false;
    }
    return true;
  };

  const simulateKnowledgeBaseCreation = async () => {
    const steps = [
      "Validating configuration...",
      "Creating vector database resources...",
      "Setting up embedding pipeline...",
      "Configuring indexing strategy...",
      "Initializing knowledge base...",
      "Running validation tests...",
      "Knowledge base ready!"
    ];

    for (let i = 0; i < steps.length; i++) {
      setCreationStep(steps[i]);
      setCreationProgress(((i + 1) / steps.length) * 100);

      // Simulate variable delay for realism
      const delay = i === 1 || i === 4 ? 2000 : 1000; // Longer for resource creation steps
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const handleCreateKnowledgeBase = async () => {
    if (!validateConfiguration()) return;

    setIsCreating(true);
    setError("");
    setCreationProgress(0);

    try {
      await simulateKnowledgeBaseCreation();

      // Generate a knowledge base ID
      const kbId = `kb-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      updateConfig({ knowledgeBaseId: kbId });

      // Auto-advance after a brief delay
      setTimeout(() => {
        onNext();
      }, 1500);
    } catch (err) {
      setError("Failed to create knowledge base. Please try again.");
      setIsCreating(false);
      setCreationProgress(0);
    }
  };

  const getChunkSizeRecommendation = (docType: string) => {
    switch (docType) {
      case "technical":
        return "1500-2000 characters for technical documents with detailed explanations";
      case "legal":
        return "800-1200 characters for legal documents with precise context";
      case "general":
        return "1000-1500 characters for general business documents";
      default:
        return "1000 characters is a good starting point for most documents";
    }
  };

  const getIndexingStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case "hierarchical":
        return "Creates summaries at multiple levels for better context retrieval";
      case "semantic":
        return "Groups similar content together for improved relevance";
      case "hybrid":
        return "Combines keyword and semantic search for best accuracy";
      case "simple":
        return "Basic chunking strategy, fastest to set up";
      default:
        return "Standard indexing approach";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateKnowledgeBase();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Create Knowledge Base
          </Heading>
          <Text
            color={tokens.colors.font.secondary}
            fontSize={tokens.fontSizes.medium}
            marginTop={tokens.space.xs}
          >
            Configure your knowledge base for optimal document chat performance
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <Alert
            variation="error"
            isDismissible={true}
            hasIcon={true}
            heading="Configuration Error"
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Main Layout */}
        <div className="kb-summary-layout">
          {/* Configuration Panel */}
          <div className="kb-panel">
            <div className="collapsible-header">
              <Heading level={5}>Knowledge Base Configuration</Heading>
              <SwitchField
                label="Advanced mode"
                labelPosition="start"
                size="small"
                checked={isAdvancedMode}
                onChange={(e) => setIsAdvancedMode(e.target.checked)}
              />
            </div>

            <div className="config-cards">
              {/* Basic Configuration */}
              <Card variation="outlined" padding={tokens.space.medium}>
                <Flex direction="column" gap={tokens.space.medium}>
                  <Heading level={6}>Basic Settings</Heading>

                  <TextField
                    label="Knowledge Base Name"
                    placeholder="My Document KB"
                    value={kbConfig.name}
                    onChange={(e) => updateKbConfig({ name: e.target.value })}
                    isRequired={true}
                    descriptiveText="A descriptive name for your knowledge base"
                    size="large"
                  />

                  <TextAreaField
                    label="Description"
                    placeholder="This knowledge base contains documents for..."
                    value={kbConfig.description}
                    onChange={(e) =>
                      updateKbConfig({ description: e.target.value })
                    }
                    rows={3}
                    resize="vertical"
                  />

                  <SelectField
                    label="Document Type"
                    value="general"
                    onChange={(e) => {
                      const type = e.target.value;
                      // Auto-adjust chunk size based on document type
                      let newChunkSize = 1000;
                      if (type === "technical") newChunkSize = 1500;
                      else if (type === "legal") newChunkSize = 800;
                      updateKbConfig({ chunkSize: newChunkSize });
                    }}
                    descriptiveText="Help us optimize settings for your content type"
                  >
                    <option value="general">General Business Documents</option>
                    <option value="technical">Technical Documentation</option>
                    <option value="legal">Legal Documents</option>
                    <option value="academic">Academic Papers</option>
                  </SelectField>
                </Flex>
              </Card>

              {/* Advanced Configuration */}
              {isAdvancedMode && (
                <Card variation="outlined" padding={tokens.space.medium}>
                  <Flex direction="column" gap={tokens.space.medium}>
                    <Heading level={6}>Advanced Settings</Heading>

                    <SliderField
                      label={`Chunk Size: ${kbConfig.chunkSize} characters`}
                      min={100}
                      max={8000}
                      step={100}
                      value={kbConfig.chunkSize}
                      onChange={(value) => updateKbConfig({ chunkSize: value })}
                      descriptiveText={getChunkSizeRecommendation("general")}
                    />

                    <SliderField
                      label={`Chunk Overlap: ${kbConfig.chunkOverlap} characters`}
                      min={0}
                      max={Math.min(kbConfig.chunkSize - 100, 1000)}
                      step={50}
                      value={kbConfig.chunkOverlap}
                      onChange={(value) =>
                        updateKbConfig({ chunkOverlap: value })
                      }
                      descriptiveText="Overlap helps maintain context between chunks"
                    />

                    <SelectField
                      label="Indexing Strategy"
                      value={kbConfig.indexingStrategy}
                      onChange={(e) =>
                        updateKbConfig({ indexingStrategy: e.target.value })
                      }
                      descriptiveText={getIndexingStrategyDescription(
                        kbConfig.indexingStrategy
                      )}
                    >
                      <option value="hierarchical">
                        Hierarchical (Recommended)
                      </option>
                      <option value="semantic">Semantic Clustering</option>
                      <option value="hybrid">Hybrid Search</option>
                      <option value="simple">Simple Chunking</option>
                    </SelectField>

                    <SelectField
                      label="Embedding Model"
                      value={kbConfig.embeddingModel}
                      onChange={(e) =>
                        updateKbConfig({ embeddingModel: e.target.value })
                      }
                    >
                      <option value="amazon.titan-embed-text-v1">
                        Titan Embeddings (Recommended)
                      </option>
                      <option value="cohere.embed-english-v3">
                        Cohere Embeddings
                      </option>
                    </SelectField>

                    <CheckboxField
                      label="Enable metadata extraction"
                      name="enableMetadata"
                      value="yes"
                      checked={kbConfig.enableMetadata}
                      onChange={(e) =>
                        updateKbConfig({ enableMetadata: e.target.checked })
                      }
                      descriptiveText="Extract document structure, headings, and formatting"
                    />
                  </Flex>
                </Card>
              )}

              {/* Current Configuration Summary */}
              <Card
                backgroundColor={tokens.colors.background.secondary}
                padding={tokens.space.medium}
              >
                <Flex direction="column" gap={tokens.space.small}>
                  <Heading level={6}>Configuration Summary</Heading>

                  <Grid templateColumns="1fr 1fr" gap={tokens.space.small}>
                    <Text fontSize={tokens.fontSizes.small}>
                      <strong>Vector DB:</strong> {selectedVectorDb?.name}
                    </Text>
                    <Text fontSize={tokens.fontSizes.small}>
                      <strong>AI Model:</strong> {selectedModel?.name}
                    </Text>
                    <Text fontSize={tokens.fontSizes.small}>
                      <strong>Chunk Size:</strong> {kbConfig.chunkSize} chars
                    </Text>
                    <Text fontSize={tokens.fontSizes.small}>
                      <strong>Strategy:</strong> {kbConfig.indexingStrategy}
                    </Text>
                  </Grid>
                </Flex>
              </Card>
            </div>
          </div>

          {/* Cost & Usage Panel */}
          <div className="kb-panel">
            <div
              className="collapsible-header"
              onClick={() => setShowCostPanel(!showCostPanel)}
              style={{ cursor: "pointer" }}
            >
              <Heading level={5}>Cost Estimation</Heading>
              <span
                className={`collapse-icon ${showCostPanel ? "expanded" : ""}`}
              >
                {showCostPanel ? "−" : "+"}
              </span>
            </div>

            {showCostPanel && (
              <div className="cost-panel-content">
                <div className="usage-sliders">
                  <div className="slider-group">
                    <label>
                      <span>
                        Estimated Documents: {kbConfig.estimatedDocuments}
                      </span>
                    </label>
                    <SliderField
                      label="Documents"
                      min={10}
                      max={10000}
                      step={10}
                      value={kbConfig.estimatedDocuments}
                      onChange={(value) =>
                        updateKbConfig({ estimatedDocuments: value })
                      }
                      isValueHidden={true}
                    />
                  </div>

                  <div className="slider-group">
                    <label>
                      <span>
                        Queries per Month: {kbConfig.estimatedQueries}
                      </span>
                    </label>
                    <SliderField
                      label="Queries per Month"
                      min={100}
                      max={100000}
                      step={100}
                      value={kbConfig.estimatedQueries}
                      onChange={(value) =>
                        updateKbConfig({ estimatedQueries: value })
                      }
                      isValueHidden={true}
                    />
                  </div>
                </div>

                <CostEstimator
                  vectorDatabaseId={config.vectorDatabaseId}
                  modelId={config.modelId}
                  estimatedDocumentCount={kbConfig.estimatedDocuments}
                  estimatedQueriesPerMonth={kbConfig.estimatedQueries}
                />
              </div>
            )}
          </div>
        </div>

        {/* Creation Progress */}
        {isCreating && (
          <Card
            backgroundColor={tokens.colors.blue[10]}
            borderColor={tokens.colors.blue[40]}
            borderWidth={tokens.borderWidths.small}
            padding={tokens.space.large}
          >
            <Flex direction="column" gap={tokens.space.medium}>
              <Flex alignItems="center" gap={tokens.space.medium}>
                <Loader size="large" />
                <View flex="1">
                  <Heading level={5} margin="0">
                    Creating Knowledge Base...
                  </Heading>
                  <Text
                    fontSize={tokens.fontSizes.small}
                    color={tokens.colors.font.secondary}
                  >
                    {creationStep}
                  </Text>
                </View>
                <Text fontWeight={tokens.fontWeights.semibold}>
                  {Math.round(creationProgress)}%
                </Text>
              </Flex>

              <View
                width="100%"
                height={tokens.space.xs}
                backgroundColor={tokens.colors.blue[20]}
                borderRadius={tokens.radii.small}
                position="relative"
                overflow="hidden"
              >
                <View
                  width={`${creationProgress}%`}
                  height="100%"
                  backgroundColor={tokens.colors.blue[60]}
                  borderRadius={tokens.radii.small}
                  style={{
                    transition: "width 0.3s ease"
                  }}
                />
              </View>

              <Text
                fontSize={tokens.fontSizes.small}
                color={tokens.colors.blue[70]}
                textAlign="center"
              >
                This process typically takes 2-5 minutes depending on your
                configuration.
              </Text>
            </Flex>
          </Card>
        )}

        {/* Ready State */}
        {config.knowledgeBaseId && !isCreating && (
          <Alert
            variation="success"
            isDismissible={false}
            hasIcon={true}
            heading="Knowledge Base Created Successfully!"
          >
            <Text>
              Your knowledge base <strong>{kbConfig.name}</strong> is ready. You
              can now proceed to configure deployment options.
            </Text>
          </Alert>
        )}

        {/* Navigation */}
        <Flex justifyContent="space-between" marginTop={tokens.space.medium}>
          <Button
            onClick={onBack}
            variation="link"
            size="large"
            isDisabled={isCreating}
          >
            ← Back to Model Selection
          </Button>

          {!config.knowledgeBaseId ? (
            <Button
              type="submit"
              variation="primary"
              size="large"
              isLoading={isCreating}
              loadingText="Creating..."
              isDisabled={!kbConfig.name.trim()}
            >
              Create Knowledge Base
            </Button>
          ) : (
            <Button onClick={onNext} variation="primary" size="large">
              Continue to Deployment →
            </Button>
          )}
        </Flex>
      </Flex>
    </form>
  );
};

export default KnowledgeBaseCreation;
