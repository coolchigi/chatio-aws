import React, { useState, useEffect } from 'react';
import { vectorDatabaseOptions, bedrockModelOptions } from '../../config/aws-config';

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

  // Selected database and model
  const selectedDatabase = vectorDatabaseOptions.find(db => db.id === vectorDatabaseId);
  const selectedModel = bedrockModelOptions.find(model => model.id === modelId);

  useEffect(() => {
    // This is a simplified cost estimation model
    // In a real application, you would use more accurate pricing data and formulas
    
    // Estimate storage costs based on document count
    // Assuming average document size of 2MB and vector size of 1KB per chunk
    const avgDocSizeMB = 2;
    const totalStorageGB = (estimatedDocumentCount * avgDocSizeMB) / 1024;
    
    // Storage cost estimates (simplified)
    let storageCost = 0;
    switch (vectorDatabaseId) {
      case 'opensearch':
        storageCost = totalStorageGB * 0.125; // $0.125 per GB-month
        break;
      case 'aurora':
        storageCost = totalStorageGB * 0.10; // $0.10 per GB-month
        break;
      case 'dynamodb':
        storageCost = totalStorageGB * 0.25; // $0.25 per GB-month
        break;
      case 'kendra':
        storageCost = estimatedDocumentCount * 0.00025; // $0.00025 per document
        break;
      case 'pinecone':
        storageCost = totalStorageGB * 0.20; // $0.20 per GB-month
        break;
      default:
        storageCost = totalStorageGB * 0.15; // Default estimate
    }
    
    // Processing cost (document ingestion)
    // Assuming 500 tokens per page, 20 pages per document average
    const tokensPerDoc = 500 * 20;
    const totalTokens = estimatedDocumentCount * tokensPerDoc;
    const processingCost = totalTokens * 0.0001 / 1000; // $0.0001 per 1K tokens
    
    // Query cost
    // Assuming 100 tokens per query and 500 tokens per response
    const inputTokensPerMonth = estimatedQueriesPerMonth * 100;
    const outputTokensPerMonth = estimatedQueriesPerMonth * 500;
    
    // Get model pricing
    let inputTokenPrice = 0.01; // Default per 1K tokens
    let outputTokenPrice = 0.03; // Default per 1K tokens
    
    if (selectedModel) {
      // Extract pricing from the string (this is simplified)
      const inputMatch = selectedModel.pricing.match(/\$(\d+\.\d+) per 1M input tokens/);
      const outputMatch = selectedModel.pricing.match(/\$(\d+\.\d+) per 1M output tokens/);
      
      if (inputMatch) inputTokenPrice = parseFloat(inputMatch[1]) / 1000;
      if (outputMatch) outputTokenPrice = parseFloat(outputMatch[1]) / 1000;
    }
    
    const queryCost = 
      (inputTokensPerMonth * inputTokenPrice / 1000) + 
      (outputTokensPerMonth * outputTokenPrice / 1000);
    
    // Total cost
    const totalCost = storageCost + processingCost + queryCost;
    
    setCostBreakdown({
      storagePerMonth: storageCost,
      processingPerMonth: processingCost,
      queriesPerMonth: queryCost,
      totalPerMonth: totalCost,
    });
  }, [vectorDatabaseId, modelId, estimatedDocumentCount, estimatedQueriesPerMonth, selectedModel]);

  return (
    <div className="cost-estimator">
      <h3>Estimated Monthly Cost</h3>
      
      <div className="cost-summary">
        <div className="total-cost">
          <span className="cost-label">Estimated Total:</span>
          <span className="cost-value">${costBreakdown.totalPerMonth.toFixed(2)}/month</span>
        </div>
        
        <div className="cost-disclaimer">
          This is an estimate based on your selections and usage patterns.
          Actual costs may vary. See AWS Pricing Calculator for more details.
        </div>
      </div>
      
      <div className="cost-breakdown">
        <h4>Cost Breakdown</h4>
        
        <div className="breakdown-item">
          <span className="breakdown-label">Storage:</span>
          <span className="breakdown-value">${costBreakdown.storagePerMonth.toFixed(2)}/month</span>
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