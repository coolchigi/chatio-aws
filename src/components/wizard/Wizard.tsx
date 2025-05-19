import React, { useState } from "react";
import ProjectSetup from "./steps/ProjectSetup";
import DocumentStorage from "./steps/DocumentStorage";
import VectorDatabaseSelector from "../cost-optimizer/VectorDatabaseSelector";
import ModelSelector from "./steps/ModelSelector";
import KnowledgeBaseCreation from "./steps/KnowledgeBaseCreation";
import DeploymentOptions from "./steps/DeploymentOptions";
import CostSummary from "./steps/CostSummary";
import "./Wizard.css";

// Define the steps in our wizardP
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
          <div className="step-container">
            <h2>Step 3: Select Vector Database</h2>
            <p>Choose a vector database for your knowledge base</p>
            <VectorDatabaseSelector
              onSelect={(id) => updateConfig({ vectorDatabaseId: id })}
              selectedId={projectConfig.vectorDatabaseId}
            />
            <div className="wizard-buttons">
              <button onClick={prevStep}>Back</button>
              <button
                onClick={nextStep}
                disabled={!projectConfig.vectorDatabaseId}
              >
                Next
              </button>
            </div>
          </div>
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
        return <div>Unknown step</div>;
    }
  };

  // Calculate progress percentage
  const progress = ((currentStep + 1) / (Object.keys(STEPS).length / 2)) * 100;

  return (
    <div className="wizard-container">
      <div className="wizard-header">
        <h1>Chat with PDF Setup Wizard</h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="step-indicator">
          Step {currentStep + 1} of {Object.keys(STEPS).length / 2}
        </div>
      </div>

      <div className="wizard-content">{renderStep()}</div>
    </div>
  );
};

export default Wizard;
