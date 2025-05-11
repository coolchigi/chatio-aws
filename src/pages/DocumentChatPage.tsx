import React, { useState, useEffect } from 'react';
import DocumentUpload from '../components/document-chat/DocumentUpload';
import ChatInterface from '../components/document-chat/ChatInterface';
import VectorDatabaseSelector from '../components/cost-optimizer/VectorDatabaseSelector';
import CostEstimator from '../components/cost-optimizer/CostEstimator';
import { createKnowledgeBase, getKnowledgeBaseStatus } from '../services/knowledgeBaseService';
import { getUserDocuments } from '../services/s3Service';
import { bedrockModelOptions } from '../config/aws-config';

const DocumentChatPage: React.FC = () => {
  // State for document management
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string>('');
  
  // State for knowledge base
  const [vectorDatabaseId, setVectorDatabaseId] = useState<string>('opensearch');
  const [knowledgeBaseId, setKnowledgeBaseId] = useState<string | null>(null);
  const [knowledgeBaseStatus, setKnowledgeBaseStatus] = useState<string>('');
  
  // State for model selection
  const [modelId, setModelId] = useState<string>(bedrockModelOptions[0].id);
  
  // State for cost estimation
  const [estimatedDocumentCount, setEstimatedDocumentCount] = useState<number>(10);
  const [estimatedQueriesPerMonth, setEstimatedQueriesPerMonth] = useState<number>(100);
  
  // Load user documents on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const userDocs = await getUserDocuments();
        setDocuments(userDocs);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    
    loadDocuments();
  }, []);
  
  // Handle document upload success
  const handleUploadSuccess = (fileKey: string, fileName: string) => {
    const newDocument = {
      key: fileKey,
      name: fileName,
      size: 0,
      lastModified: new Date(),
    };
    
    setDocuments([...documents, newDocument]);
    setSelectedDocument(fileKey);
    setSelectedDocumentName(fileName);
  };
  
  // Handle document upload error
  const handleUploadError = (error: Error) => {
    console.error('Upload error:', error);
  };
  
  // Handle document selection
  const handleDocumentSelect = (document: any) => {
    setSelectedDocument(document.key);
    setSelectedDocumentName(document.name);
  };
  
  // Handle vector database selection
  const handleVectorDatabaseSelect = (databaseId: string) => {
    setVectorDatabaseId(databaseId);
    setKnowledgeBaseId(null);
  };
  
  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    setModelId(modelId);
  };
  
  // Create knowledge base
  const handleCreateKnowledgeBase = async () => {
    if (!selectedDocument) return;
    
    try {
      setKnowledgeBaseStatus('creating');
      
      const knowledgeBase = await createKnowledgeBase({
        name: `KB for ${selectedDocumentName}`,
        description: `Knowledge base for document: ${selectedDocumentName}`,
        vectorDatabaseId,
        documentIds: [selectedDocument],
      });
      
      setKnowledgeBaseId(knowledgeBase.id);
      setKnowledgeBaseStatus('created');
      
      // Poll for knowledge base status
      const interval = setInterval(async () => {
        const status = await getKnowledgeBaseStatus(knowledgeBase.id);
        
        if (status.status === 'READY') {
          setKnowledgeBaseStatus('ready');
          clearInterval(interval);
        } else if (status.status === 'FAILED') {
          setKnowledgeBaseStatus('failed');
          clearInterval(interval);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Error creating knowledge base:', error);
      setKnowledgeBaseStatus('failed');
    }
  };
  
  return (
    <div className="document-chat-page">
      <h2>Document Chat</h2>
      
      <div className="document-chat-container">
        <div className="document-section">
          <h3>Your Documents</h3>
          
          <DocumentUpload 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          
          <div className="document-list">
            {documents.length === 0 ? (
              <p>No documents uploaded yet.</p>
            ) : (
              <ul>
                {documents.map((doc) => (
                  <li 
                    key={doc.key}
                    className={selectedDocument === doc.key ? 'selected' : ''}
                    onClick={() => handleDocumentSelect(doc)}
                  >
                    {doc.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="setup-section">
          <h3>Setup Knowledge Base</h3>
          
          {selectedDocument ? (
            <>
              <p>Selected Document: {selectedDocumentName}</p>
              
              <VectorDatabaseSelector 
                onSelect={handleVectorDatabaseSelect}
                selectedId={vectorDatabaseId}
              />
              
              <div className="model-selector">
                <h4>Select AI Model</h4>
                <select 
                  value={modelId}
                  onChange={(e) => handleModelSelect(e.target.value)}
                >
                  {bedrockModelOptions.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.provider})
                    </option>
                  ))}
                </select>
              </div>
              
              <CostEstimator 
                vectorDatabaseId={vectorDatabaseId}
                modelId={modelId}
                estimatedDocumentCount={estimatedDocumentCount}
                estimatedQueriesPerMonth={estimatedQueriesPerMonth}
              />
              
              <div className="usage-estimator">
                <h4>Estimate Your Usage</h4>
                <div className="estimator-input">
                  <label>Number of Documents:</label>
                  <input 
                    type="number" 
                    value={estimatedDocumentCount}
                    onChange={(e) => setEstimatedDocumentCount(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="estimator-input">
                  <label>Queries per Month:</label>
                  <input 
                    type="number" 
                    value={estimatedQueriesPerMonth}
                    onChange={(e) => setEstimatedQueriesPerMonth(parseInt(e.target.value))}
                    min="1"
                  />
                </div>
              </div>
              
              <button 
                className="create-kb-button"
                onClick={handleCreateKnowledgeBase}
                disabled={!selectedDocument || knowledgeBaseStatus === 'creating'}
              >
                {knowledgeBaseStatus === 'creating' ? 'Creating...' : 'Create Knowledge Base'}
              </button>
              
              {knowledgeBaseStatus === 'failed' && (
                <div className="error-message">
                  Failed to create knowledge base. Please try again.
                </div>
              )}
            </>
          ) : (
            <p>Please select or upload a document first.</p>
          )}
        </div>
        
        <div className="chat-section">
          {knowledgeBaseId && knowledgeBaseStatus === 'ready' ? (
            <ChatInterface 
              documentId={selectedDocument || ''}
              documentName={selectedDocumentName}
              knowledgeBaseId={knowledgeBaseId}
              vectorDatabaseId={vectorDatabaseId}
            />
          ) : (
            <div className="chat-placeholder">
              {knowledgeBaseStatus === 'creating' ? (
                <p>Creating knowledge base... This may take a few minutes.</p>
              ) : (
                <p>Create a knowledge base to start chatting with your document.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentChatPage;