import { useState, useEffect } from 'react';
import { useSession } from '../SessionContext';
import { config } from '../config';

export function S3Manager() {
  const { credentials, addResource, bucketName: sessionBucketName, setBucketName: setSessionBucketName } = useSession();
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const createBucket = async () => {
    if (!credentials) return;
    
    setError('');

    try {
      const response = await fetch(`${config.backendUrl}/api/s3/create-bucket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create bucket');
      }

      setSessionBucketName(data.bucketName);
      addResource({ type: 's3', id: data.bucketName, name: data.bucketName });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const listFiles = async () => {
    if (!credentials || !sessionBucketName) return;

    try {
      const response = await fetch(`${config.backendUrl}/api/s3/list-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials, bucketName: sessionBucketName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to list files');
      }

      setFiles(data.files);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const uploadFile = async (file: File) => {
    if (!credentials || !sessionBucketName) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucketName', sessionBucketName);
      formData.append('credentials', JSON.stringify(credentials));

      const response = await fetch(`${config.backendUrl}/api/s3/upload-file`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      await listFiles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!credentials || !sessionBucketName) return;

    try {
      const response = await fetch(`${config.backendUrl}/api/s3/delete-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials, bucketName: sessionBucketName, fileName })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete file');
      }

      await listFiles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (sessionBucketName) {
      listFiles();
    }
  }, [sessionBucketName]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
      <h2>S3 Bucket Manager</h2>

      {!sessionBucketName ? (
        <button onClick={createBucket}>Create PDF Bucket</button>
      ) : (
        <div>
          <p>Bucket: <strong>{sessionBucketName}</strong></p>

          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadFile(file);
              }}
              disabled={uploading}
            />
            {uploading && <span>Uploading...</span>}
          </div>

          <h3>Files ({files.length})</h3>
          {files.length === 0 ? (
            <p>No files uploaded yet</p>
          ) : (
            <ul>
              {files.map(file => (
                <li key={file}>
                  {file}
                  <button onClick={() => deleteFile(file)} style={{ marginLeft: '10px' }}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
