import React, { useState } from "react";
import CostEstimator from "../../cost-optimizer/CostEstimator";
import { downloadZip } from "../../../utils/downloadUtils";
import { generateAmplifyProject } from '../../../generators/amplifyGenerator';

interface CostSummaryProps {
  config: {
    name: string;
    region: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  onBack: () => void;
  onFinish: () => void;
}

const CostSummary: React.FC<CostSummaryProps> = ({
  config,
  onBack,
  onFinish
}) => {
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);

    // In a real app, this would trigger the deployment process
    setTimeout(() => {
      setIsDeploying(false);
      onFinish();
    }, 3000);
  };

  const handleExport = async () => {
    const files = generateAmplifyProject(config);
    await downloadZip(files, `${config.name}-amplify-app.zip`);
  };

  return (
    <div className="step-container">
      <h2>Summary and Deployment</h2>
      <p>Review your configuration and deploy your chat application</p>

      <div className="summary-section">
        <h3>Project Configuration</h3>
        <div className="summary-item">
          <span className="summary-label">Project Name:</span>
          <span className="summary-value">{config.name}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">AWS Region:</span>
          <span className="summary-value">{config.region}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Vector Database:</span>
          <span className="summary-value">{config.vectorDatabaseId}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">AI Model:</span>
          <span className="summary-value">{config.modelId}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Knowledge Base ID:</span>
          <span className="summary-value">{config.knowledgeBaseId}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Deployment Option:</span>
          <span className="summary-value">{config.deploymentOption}</span>
        </div>
      </div>

      <div className="cost-section">
        <h3>Estimated Monthly Cost</h3>
        <CostEstimator
          vectorDatabaseId={config.vectorDatabaseId}
          modelId={config.modelId}
          estimatedDocumentCount={10}
          estimatedQueriesPerMonth={100}
        />
      </div>

      <div className="deployment-actions">
        {config.deploymentOption === "amplify" ? (
          <button
            className="primary-button"
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            {isDeploying ? "Deploying..." : "Deploy to Amplify"}
          </button>
        ) : (
          <button className="primary-button" onClick={handleExport}>
  Download Amplify Project
</button>
        )}
      </div>

      <div className="wizard-buttons">
        <button onClick={onBack}>Back</button>
        <div></div> {/* Empty div for spacing */}
      </div>
    </div>
  );
};

export default CostSummary;
