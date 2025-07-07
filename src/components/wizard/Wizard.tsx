import React, { useState } from "react";
import {
  Card,
  Heading,
  Text,
  Flex,
  View,
  useTheme
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import ProjectSetup from "./steps/ProjectSetup";
import VectorDatabase from "./steps/VectorDatabase";
import ModelSelector from "./steps/ModelSelector";
import KnowledgeBaseCreation from "./steps/KnowledgeBaseCreation";
import DeploymentOptions from "./steps/DeploymentOptions";
import CostSummary from "./steps/CostSummary";
import "./Wizard.css";

// Define the steps in our wizard
const STEPS = {
  PROJECT_SETUP: 0,
  VECTOR_DATABASE: 1,  
  MODEL_SELECTION: 2,  
  KNOWLEDGE_BASE: 3,   
  DEPLOYMENT: 4,       
  SUMMARY: 5         
};

const Wizard: React.FC = () => {
  const { tokens } = useTheme();
  const [currentStep, setCurrentStep] = useState(STEPS.PROJECT_SETUP);
  const [projectConfig, setProjectConfig] = useState({
    name: "",
    region: "us-east-1",
    vectorDatabaseId: "",
    modelId: "",
    knowledgeBaseId: "",
    deploymentOption: ""
  });

  const updateConfig = (updates: Partial<typeof projectConfig>) => {
    setProjectConfig((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

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
      case STEPS.VECTOR_DATABASE:
        return (
          <VectorDatabase
            config={projectConfig}
            updateConfig={updateConfig}
            onNext={nextStep}
            onBack={prevStep}
          />
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
