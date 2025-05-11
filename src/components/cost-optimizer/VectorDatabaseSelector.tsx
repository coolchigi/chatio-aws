import React, { useState } from 'react';
import { vectorDatabaseOptions } from '../../config/aws-config';

interface VectorDatabaseSelectorProps {
  onSelect: (databaseId: string) => void;
  selectedId?: string;
}

const VectorDatabaseSelector: React.FC<VectorDatabaseSelectorProps> = ({ 
  onSelect, 
  selectedId 
}) => {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    onSelect(id);
  };

  const toggleDetails = (id: string) => {
    setShowDetails(showDetails === id ? null : id);
  };

  return (
    <div className="vector-database-selector">
      <h3>Select Vector Database</h3>
      <p>Choose a vector database for your knowledge base</p>
      
      <div className="database-options">
        {vectorDatabaseOptions.map((db) => (
          <div 
            key={db.id} 
            className={`database-option ${selectedId === db.id ? 'selected' : ''}`}
          >
            <div className="option-header">
              <h4>{db.name}</h4>
              <div className="option-actions">
                <button 
                  className="details-button"
                  onClick={() => toggleDetails(db.id)}
                >
                  {showDetails === db.id ? 'Hide Details' : 'Show Details'}
                </button>
                <button 
                  className="select-button"
                  onClick={() => handleSelect(db.id)}
                  disabled={selectedId === db.id}
                >
                  {selectedId === db.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
            
            <div className="option-description">
              {db.description}
            </div>
            
            {showDetails === db.id && (
              <div className="option-details">
                <div className="detail-item">
                  <span className="detail-label">Pricing:</span>
                  <span className="detail-value">{db.pricing}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Setup Complexity:</span>
                  <span className="detail-value">{db.setupComplexity}</span>
                </div>
                <div className="detail-item">
                  <a 
                    href={db.pricingDetails} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="pricing-link"
                  >
                    View Detailed Pricing
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VectorDatabaseSelector;