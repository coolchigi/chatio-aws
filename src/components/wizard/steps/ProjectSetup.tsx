import React from "react";

interface ProjectSetupProps {
  config: {
    name: string;
    region: string;
  };
  updateConfig: (updates: Partial<{ name: string; region: string }>) => void;
  onNext: () => void;
}

const ProjectSetup: React.FC<ProjectSetupProps> = ({
  config,
  updateConfig,
  onNext
}) => {
  const regions = [
    { id: "us-east-1", name: "US East (N. Virginia)" },
    { id: "us-east-2", name: "US East (Ohio)" },
    { id: "us-west-1", name: "US West (N. California)" },
    { id: "us-west-2", name: "US West (Oregon)" },
    { id: "eu-west-1", name: "EU (Ireland)" },
    { id: "eu-central-1", name: "EU (Frankfurt)" },
    { id: "ap-northeast-1", name: "Asia Pacific (Tokyo)" },
    { id: "ap-southeast-1", name: "Asia Pacific (Singapore)" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="step-container">
      <h2>Step 1: Project Setup</h2>
      <p>Let's start by setting up your project</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            type="text"
            value={config.name}
            onChange={(e) => updateConfig({ name: e.target.value })}
            placeholder="My Chat with PDF Project"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="region">AWS Region</label>
          <select
            id="region"
            value={config.region}
            onChange={(e) => updateConfig({ region: e.target.value })}
            required
          >
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <small>
            Choose the region closest to your users for best performance
          </small>
        </div>

        <div className="wizard-buttons">
          <div></div> {/* Empty div for spacing */}
          <button type="submit" disabled={!config.name}>
            Next
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectSetup;
