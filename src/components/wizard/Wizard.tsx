// src/components/wizard/Wizard.tsx
import React, { useState } from "react";
import {
  Card,
  Heading,
  Text,
  Flex,
  Button,
  View,
  useTheme
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ProjectSetup from "./steps/ProjectSetup";
import DocumentStorage from "./steps/DocumentStorage";
import VectorDatabaseSelector from "../cost-optimizer/VectorDatabaseSelector";
import ModelSelector from "./steps/ModelSelector";
import KnowledgeBaseCreation from "./steps/KnowledgeBaseCreation";
import DeploymentOptions from "./steps/DeploymentOptions";
import CostSummary from "./steps/CostSummary";
import "./Wizard.css";

// Define the steps in our wizard
const STEPS = {
  PROJECT_SETUP: 0,
  DOCUMENT_STORAGE: 1,
  VECTOR_DATABASE: 2,
  MODEL_SELECTION: 3,
  KNOWLEDGE_BASE: 4,
  DEPLOYMENT: 5,
  SUMMARY: 6
};

const Wizard: React.FC = () => {
  const { tokens } = useTheme();
  const [currentStep, setCurrentStep] = useState(STEPS.PROJECT_SETUP);
  const [projectConfig, setProjectConfig] = useState({
    name: "",
    region: "us-east-1",
    s3Bucket: "",
    vectorDatabaseId: "",
    modelId: "",
    knowledgeBaseId: "",
    deploymentOption: ""
  });

  // Update configuration based on step inputs
  const updateConfig = (updates: Partial<typeof projectConfig>) => {
    setProjectConfig((prev) => ({ ...prev, ...updates }));
  };

  // Navigate to next step
  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.PROJECT_SETUP:
        return (
          <ProjectSetup
            config={projectConfig}
            updateConfig={updateConfig}
            onNext={nextStep}
          />
        );
      case STEPS.DOCUMENT_STORAGE:
        return (
          <DocumentStorage
            config={projectConfig}
            updateConfig={updateConfig}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case STEPS.VECTOR_DATABASE:
        return (
          <Flex direction="column" gap={tokens.space.medium}>
            <Heading level={3}>Step 3: Select Vector Database</Heading>
            <Text>Choose a vector database for your knowledge base</Text>
            <VectorDatabaseSelector
              onSelect={(id) => updateConfig({ vectorDatabaseId: id })}
              selectedId={projectConfig.vectorDatabaseId}
            />
            <Flex justifyContent="space-between" marginTop={tokens.space.large}>
              <Button onClick={prevStep} variation="link">
                Back
              </Button>
              <Button
                onClick={nextStep}
                variation="primary"
                isDisabled={!projectConfig.vectorDatabaseId}
              >
                Next
              </Button>
            </Flex>
          </Flex>
        );
      case STEPS.MODEL_SELECTION:
        return (
          <ModelSelector
            config={projectConfig}
            updateConfig={updateConfig}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case STEPS.KNOWLEDGE_BASE:
        return (
          <KnowledgeBaseCreation
            config={projectConfig}
            updateConfig={updateConfig}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case STEPS.DEPLOYMENT:
        return (
          <DeploymentOptions
            config={projectConfig}
            updateConfig={updateConfig}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case STEPS.SUMMARY:
        return (
          <CostSummary
            config={projectConfig}
            onBack={prevStep}
            onFinish={() => console.log("Deployment complete!")}
          />
        );
      default:
        return <Text>Unknown step</Text>;
    }
  };

  // Calculate progress percentage
  const progress = ((currentStep + 1) / Object.keys(STEPS).length) * 100;

  return (
    <View maxWidth="900px" margin="0 auto" padding={tokens.space.large}>
      <Card variation="elevated" padding={tokens.space.large}>
        <Flex direction="column" gap={tokens.space.medium}>
          {/* Wizard Header */}
          <View textAlign="center">
            <Heading level={2}>Chat with PDF Setup Wizard</Heading>

            {/* Progress Bar */}
            <View marginTop={tokens.space.medium}>
              <View
                backgroundColor={tokens.colors.background.secondary}
                borderRadius={tokens.radii.small}
                height="8px"
                marginBottom={tokens.space.xs}
              >
                <View
                  backgroundColor={tokens.colors.primary[60]}
                  height="100%"
                  width={`${progress}%`}
                  borderRadius={tokens.radii.small}
                  style={{ transition: "width 0.3s ease" }}
                />
              </View>

              {/* Step Indicator */}
              <Text
                color={tokens.colors.font.secondary}
                fontSize={tokens.fontSizes.small}
              >
                Step {currentStep + 1} of {Object.keys(STEPS).length}
              </Text>
            </View>
          </View>

          {/* Wizard Content */}
          <Card variation="outlined" padding={tokens.space.large}>
            {renderStep()}
          </Card>
        </Flex>
      </Card>
    </View>
  );
};

export default Wizard;
