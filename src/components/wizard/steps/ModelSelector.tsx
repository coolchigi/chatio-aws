import React from "react";
import { bedrockModelOptions } from "../../../config/aws-config";

interface ModelSelectorProps {
  config: {
    modelId: string;
    region: string;
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
  // Filter models based on region availability (in a real app)
  const availableModels = bedrockModelOptions;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="step-container">
      <h2>Step 4: Select AI Model</h2>
      <p>Choose the Bedrock model for your chat application</p>

      <form onSubmit={handleSubmit}>
        <div className="model-options">
          {availableModels.map((model) => (
            <div
              key={model.id}
              className={`model-card ${
                config.modelId === model.id ? "selected" : ""
              }`}
              onClick={() => updateConfig({ modelId: model.id })}
            >
              <div className="model-header">
                <h3>{model.name}</h3>
                <span className="provider">{model.provider}</span>
              </div>

              <div className="model-details">
                <div className="detail-item">
                  <span className="detail-label">Context Window:</span>
                  <span className="detail-value">{model.contextWindow}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pricing:</span>
                  <span className="detail-value">{model.pricing}</span>
                </div>
              </div>

              {config.modelId === model.id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>

        <div className="wizard-buttons">
          <button type="button" onClick={onBack}>
            Back
          </button>
          <button type="submit" disabled={!config.modelId}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModelSelector;
