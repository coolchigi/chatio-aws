import { Router } from 'express';
import { S3Client, CreateBucketCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand, DeleteBucketCommand } from '@aws-sdk/client-s3';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware to create S3 client from request credentials
function getS3Client(req: any) {
  const { accessKeyId, secretAccessKey, sessionToken } = req.body.credentials;
  
  if (!accessKeyId || !secretAccessKey || !sessionToken) {
    throw new Error('Missing credentials');
  }

  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId,
      secretAccessKey,
      sessionToken
    }
  });
}

// Create bucket
router.post('/create-bucket', async (req, res) => {
  try {
    const s3Client = getS3Client(req);
    const bucketName = `chatio-${Date.now()}`;

    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));

    res.json({ bucketName });
  } catch (error: any) {
    console.error('Create bucket error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List files in bucket
router.post('/list-files', async (req, res) => {
  try {
    const s3Client = getS3Client(req);
    const { bucketName } = req.body;

    if (!bucketName) {
      return res.status(400).json({ error: 'Bucket name required' });
    }

    const response = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const files = response.Contents?.map(obj => obj.Key!) || [];

    res.json({ files });
  } catch (error: any) {
    console.error('List files error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload file
router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const s3Client = getS3Client(req);
    const { bucketName } = req.body;
    const file = req.file;

    if (!bucketName || !file) {
      return res.status(400).json({ error: 'Bucket name and file required' });
    }

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    }));

    res.json({ success: true, fileName: file.originalname });
  } catch (error: any) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.post('/delete-file', async (req, res) => {
  try {
    const s3Client = getS3Client(req);
    const { bucketName, fileName } = req.body;

    if (!bucketName || !fileName) {
      return res.status(400).json({ error: 'Bucket name and file name required' });
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName
    }));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete bucket
router.post('/delete-bucket', async (req, res) => {
  try {
    const s3Client = getS3Client(req);
    const { bucketName } = req.body;

    if (!bucketName) {
      return res.status(400).json({ error: 'Bucket name required' });
    }

    // Delete all objects first
    const listResponse = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const objects = listResponse.Contents || [];

    for (const obj of objects) {
      await s3Client.send(new DeleteObjectCommand({
        Bucket: bucketName,
        Key: obj.Key!
      }));
    }

    // Delete bucket
    await s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete bucket error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
