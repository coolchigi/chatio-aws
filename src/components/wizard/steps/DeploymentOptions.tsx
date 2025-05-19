import React, { useState } from "react";

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

const DeploymentOptions: React.FC<DeploymentOptionsProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const [deployOption, setDeployOption] = useState(
    config.deploymentOption || "amplify"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({ deploymentOption: deployOption });
    onNext();
  };

  return (
    <div className="step-container">
      <h2>Step 6: Deployment Options</h2>
      <p>Choose how you want to deploy your chat application</p>

      <form onSubmit={handleSubmit}>
        <div className="deployment-options">
          <div
            className={`deployment-option ${
              deployOption === "amplify" ? "selected" : ""
            }`}
            onClick={() => setDeployOption("amplify")}
          >
            <h3>Deploy to AWS Amplify</h3>
            <p>One-click deployment to AWS Amplify Hosting</p>
            <ul>
              <li>Managed hosting with CI/CD</li>
              <li>Automatic HTTPS</li>
              <li>Global CDN distribution</li>
            </ul>
          </div>

          <div
            className={`deployment-option ${
              deployOption === "cloudformation" ? "selected" : ""
            }`}
            onClick={() => setDeployOption("cloudformation")}
          >
            <h3>Export CloudFormation</h3>
            <p>Generate a CloudFormation template</p>
            <ul>
              <li>Deploy using AWS Console</li>
              <li>Customize resources</li>
              <li>Infrastructure as Code</li>
            </ul>
          </div>

          <div
            className={`deployment-option ${
              deployOption === "cdk" ? "selected" : ""
            }`}
            onClick={() => setDeployOption("cdk")}
          >
            <h3>Export CDK Code</h3>
            <p>Generate AWS CDK code</p>
            <ul>
              <li>TypeScript/Python code</li>
              <li>Programmatic customization</li>
              <li>Advanced deployment options</li>
            </ul>
          </div>
        </div>

        <div className="wizard-buttons">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="submit">Next</button>
        </div>
      </form>
    </div>
  );
};

export default DeploymentOptions;
