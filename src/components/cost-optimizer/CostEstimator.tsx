import React, { useState, useEffect } from 'react';
import { vectorDatabaseOptions, bedrockModelOptions } from '../../config/aws-config';
import { calculateOpenSearchCost } from '../../cost/costCalculators';
import { OPENSEARCH_PRICING } from '../../cost/pricingData';

interface CostEstimatorProps {
  vectorDatabaseId: string;
  modelId: string;
  estimatedDocumentCount: number;
  estimatedQueriesPerMonth: number;
}

interface CostBreakdown {
  storagePerMonth: number;
  processingPerMonth: number;
  queriesPerMonth: number;
  totalPerMonth: number;
  computePerMonth?: number; 
  computeBreakdown?: string; 
  storageBreakdown?: string;
}

const CostEstimator: React.FC<CostEstimatorProps> = ({
  vectorDatabaseId,
  modelId,
  estimatedDocumentCount,
  estimatedQueriesPerMonth,
}) => {
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
    storagePerMonth: 0,
    processingPerMonth: 0,
    queriesPerMonth: 0,
    totalPerMonth: 0,
  });
  // Add local state for storage for OpenSearch
  const [userStorageGB, setUserStorageGB] = useState<number>(50);

  // Selected database and model
  const selectedDatabase = vectorDatabaseOptions.find(db => db.id === vectorDatabaseId);
  const selectedModel = bedrockModelOptions.find(model => model.id === modelId);

  useEffect(() => {
    let storageCost = 0;
    let computeCost = 0;
    let totalCost = 0;
    let computeBreakdown = '';
    let storageBreakdown = '';
    if (vectorDatabaseId === 'opensearch') {
      const result = calculateOpenSearchCost({
        storageGB: userStorageGB,
        nodes: 2, // minimum for serverless
        instanceType: "serverless", // or a placeholder string
        serverless: true
      });
      computeCost = result.compute;
      storageCost = result.storage;
      totalCost = result.total;
      computeBreakdown = result.breakdown.compute;
      storageBreakdown = result.breakdown.storage;
    } else if (vectorDatabaseId === 'opensearch-serverless') {
      const result = calculateOpenSearchCost({
        storageGB: userStorageGB,
        nodes: 2, // minimum for serverless
        instanceType: "serverless", // or a placeholder string
        serverless: true
      });
      computeCost = result.compute;
      storageCost = result.storage;
      totalCost = result.total;
      computeBreakdown = result.breakdown.compute;
      storageBreakdown = result.breakdown.storage;
    } else {
      // Estimate storage costs based on document count
      const avgDocSizeMB = 2;
      const totalStorageGB = (estimatedDocumentCount * avgDocSizeMB) / 1024;
      switch (vectorDatabaseId) {
        case 'aurora':
          storageCost = totalStorageGB * 0.10;
          break;
        case 'dynamodb':
          storageCost = totalStorageGB * 0.25;
          break;
        case 'kendra':
          storageCost = estimatedDocumentCount * 0.00025;
          break;
        case 'pinecone':
          storageCost = totalStorageGB * 0.20;
          break;
        default:
          storageCost = totalStorageGB * 0.15;
      }
      totalCost = storageCost;
    }
    // Processing and query cost logic (unchanged for now)
    const tokensPerDoc = 500 * 20;
    const totalTokens = estimatedDocumentCount * tokensPerDoc;
    const processingCost = totalTokens * 0.0001 / 1000;
    const inputTokensPerMonth = estimatedQueriesPerMonth * 100;
    const outputTokensPerMonth = estimatedQueriesPerMonth * 500;
    let inputTokenPrice = 0.01;
    let outputTokenPrice = 0.03;
    if (selectedModel) {
      const inputMatch = selectedModel.pricing.match(/\$(\d+\.\d+) per 1M input tokens/);
      const outputMatch = selectedModel.pricing.match(/\$(\d+\.\d+) per 1M output tokens/);
      if (inputMatch) inputTokenPrice = parseFloat(inputMatch[1]) / 1000;
      if (outputMatch) outputTokenPrice = parseFloat(outputMatch[1]) / 1000;
    }
    const queryCost =
      (inputTokensPerMonth * inputTokenPrice / 1000) +
      (outputTokensPerMonth * outputTokenPrice / 1000);
    // Add processing and query cost to total
    totalCost += processingCost + queryCost;
    setCostBreakdown({
      storagePerMonth: storageCost,
      processingPerMonth: processingCost,
      queriesPerMonth: queryCost,
      totalPerMonth: totalCost,
      computePerMonth: computeCost,
      computeBreakdown,
      storageBreakdown,
    });
  }, [vectorDatabaseId, modelId, estimatedDocumentCount, estimatedQueriesPerMonth, selectedModel, userStorageGB]);

  return (
    <div className="cost-estimator">
      <h3>Estimated Monthly Cost</h3>
      {/* Storage size slider for OpenSearch */}
      {vectorDatabaseId === 'opensearch' || vectorDatabaseId === 'opensearch-serverless' ? (
        <div className="storage-slider">
          <label>
            Storage Size: {userStorageGB} GB
            <input
              type="range"
              min={10}
              max={500}
              step={1}
              value={userStorageGB}
              onChange={e => setUserStorageGB(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
        </div>
      ) : null}
      <div className="cost-summary">
        <div className="total-cost">
          <span className="cost-label">Estimated Total:</span>
          <span className="cost-value">${costBreakdown.totalPerMonth.toFixed(2)}/month</span>
        </div>
        <div className="cost-disclaimer">
          This is an estimate based on your selections and usage patterns.<br />
          Actual costs may vary. See:
          <ul>
            <li><a href={OPENSEARCH_PRICING.docs.main} target="_blank" rel="noopener noreferrer">AWS OpenSearch Pricing</a></li>
            <li><a href={OPENSEARCH_PRICING.docs.ebs} target="_blank" rel="noopener noreferrer">AWS EBS Pricing</a></li>
            <li><a href={OPENSEARCH_PRICING.docs.calculator} target="_blank" rel="noopener noreferrer">AWS Pricing Calculator</a></li>
          </ul>
        </div>
      </div>
      <div className="cost-breakdown">
        <h4>Cost Breakdown</h4>
        {costBreakdown.computePerMonth !== undefined && costBreakdown.computePerMonth > 0 && (
          <div className="breakdown-item">
            <span className="breakdown-label">Compute:</span>
            <span className="breakdown-value">${costBreakdown.computePerMonth.toFixed(2)}/month</span>
            <div className="breakdown-detail">{costBreakdown.computeBreakdown}</div>
          </div>
        )}
        <div className="breakdown-item">
          <span className="breakdown-label">Storage:</span>
          <span className="breakdown-value">${costBreakdown.storagePerMonth.toFixed(2)}/month</span>
          {costBreakdown.storageBreakdown && <div className="breakdown-detail">{costBreakdown.storageBreakdown}</div>}
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Document Processing:</span>
          <span className="breakdown-value">${costBreakdown.processingPerMonth.toFixed(2)}/month</span>
        </div>
        <div className="breakdown-item">
          <span className="breakdown-label">Queries:</span>
          <span className="breakdown-value">${costBreakdown.queriesPerMonth.toFixed(2)}/month</span>
        </div>
      </div>
      
      <div className="selected-services">
        <h4>Selected Services</h4>
        
        <div className="service-item">
          <span className="service-label">Vector Database:</span>
          <span className="service-value">{selectedDatabase?.name || 'None selected'}</span>
        </div>
        
        <div className="service-item">
          <span className="service-label">AI Model:</span>
          <span className="service-value">{selectedModel?.name || 'None selected'}</span>
        </div>
      </div>
      
      <div className="cost-actions">
        <a 
          href="https://calculator.aws" 
          target="_blank" 
          rel="noopener noreferrer"
          className="calculator-link"
        >
          Get Detailed Estimate with AWS Pricing Calculator
        </a>
      </div>
    </div>
  );
};

export default CostEstimator;