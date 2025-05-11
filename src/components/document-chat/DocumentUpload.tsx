import React, { useState } from 'react';
import { uploadToS3 } from '../../services/s3Service';

interface DocumentUploadProps {
  onUploadSuccess: (fileKey: string, fileName: string) => void;
  onUploadError: (error: Error) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(0);

      // Upload to S3 with progress tracking
      const fileKey = await uploadToS3(file, (progress) => {
        setProgress(progress);
      });

      onUploadSuccess(fileKey, file.name);
    } catch (error) {
      console.error('Error uploading file:', error);
      onUploadError(error as Error);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="document-upload">
      <h3>Upload Document</h3>
      <p>Upload a PDF document to chat with it</p>
      
      <div className="upload-container">
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        <button 
          onClick={handleUpload} 
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      
      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${progress}%` }}
          ></div>
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;