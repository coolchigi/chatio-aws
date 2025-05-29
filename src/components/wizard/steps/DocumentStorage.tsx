// src/components/wizard/steps/DocumentStorage.tsx
import React, { useState, useRef } from "react";
import {
  Heading,
  Text,
  Flex,
  Button,
  TextField,
  View,
  useTheme,
  Alert,
  Card,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Icon,
  DropZone,
  VisuallyHidden,
  Loader
} from "@aws-amplify/ui-react";

interface DocumentStorageProps {
  config: {
    name: string;
    region: string;
    s3Bucket: string;
    vectorDatabaseId: string;
    modelId: string;
    knowledgeBaseId: string;
    deploymentOption: string;
  };
  updateConfig: (updates: Partial<{ s3Bucket: string }>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  id: string;
}

const DocumentStorage: React.FC<DocumentStorageProps> = ({
  config,
  updateConfig,
  onNext,
  onBack
}) => {
  const { tokens } = useTheme();
  const [bucketName, setBucketName] = useState(config.s3Bucket || "");
  const [isCreating, setIsCreating] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(!!config.s3Bucket);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const validateBucketName = (name: string): string => {
    if (!name) return "Please enter a bucket name";
    if (name.length < 3) return "Bucket name must be at least 3 characters";
    if (name.length > 63) return "Bucket name must be less than 63 characters";
    if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
      return "Bucket name must start and end with lowercase letter or number";
    }
    if (name.includes(".."))
      return "Bucket name cannot contain consecutive periods";
    return "";
  };

  const handleBucketNameChange = (value: string) => {
    setBucketName(value);
    const validationError = validateBucketName(value);
    if (validationError) {
      setError(validationError);
    } else {
      setError("");
    }
  };

  const handleCreateBucket = async () => {
    const validationError = validateBucketName(bucketName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      // Simulate bucket creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      updateConfig({ s3Bucket: bucketName });
      setCreationSuccess(true);
    } catch (err) {
      setError("Failed to create bucket. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const generateBucketName = () => {
    const prefix = config.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const timestamp = Date.now().toString().slice(-6);
    const newName = `${prefix}-docs-${timestamp}`;
    setBucketName(newName);
    handleBucketNameChange(newName);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const simulateFileUpload = async (files: File[]): Promise<void> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Add files to uploaded list
      const newFiles: UploadedFile[] = files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
        id: Math.random().toString(36).substr(2, 9)
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch (err) {
      setError("Failed to upload files. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelection = (files: File[]) => {
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length !== files.length) {
      setError("Only PDF files are allowed");
      return;
    }

    if (pdfFiles.length === 0) {
      setError("Please select at least one PDF file");
      return;
    }

    simulateFileUpload(pdfFiles);
  };

  const handleDropZoneFiles = ({
    acceptedFiles
  }: {
    acceptedFiles: File[];
  }) => {
    handleFileSelection(acceptedFiles);
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileSelection(Array.from(files));
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bucketName || !creationSuccess) {
      setError("Please create an S3 bucket first");
      return;
    }

    if (uploadedFiles.length === 0) {
      setError("Please upload at least one PDF document");
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={tokens.space.large}>
        {/* Header */}
        <View textAlign="center">
          <Heading level={3} color={tokens.colors.primary[80]}>
            Document Storage
          </Heading>
          <Text
            color={tokens.colors.font.secondary}
            fontSize={tokens.fontSizes.medium}
            marginTop={tokens.space.xs}
          >
            Set up S3 storage and upload your PDF documents
          </Text>
        </View>

        {/* Error Alert */}
        {error && (
          <Alert
            variation="error"
            isDismissible={true}
            hasIcon={true}
            heading="Error"
            onDismiss={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* S3 Bucket Creation */}
        <Card
          variation="outlined"
          padding={tokens.space.large}
          borderRadius={tokens.radii.medium}
        >
          <Flex direction="column" gap={tokens.space.medium}>
            <Flex alignItems="center" gap={tokens.space.small}>
              <Heading level={5}>1. Create S3 Bucket</Heading>
              {creationSuccess && (
                <Badge variation="success" size="small">
                  ✓ Created
                </Badge>
              )}
            </Flex>

            <Text
              fontSize={tokens.fontSizes.small}
              color={tokens.colors.font.secondary}
            >
              Your documents will be stored securely in Amazon S3
            </Text>

            <Flex alignItems="flex-end" gap={tokens.space.small}>
              <TextField
                label="Bucket Name"
                placeholder="my-document-bucket"
                value={bucketName}
                onChange={(e) => handleBucketNameChange(e.target.value)}
                isDisabled={creationSuccess || isCreating}
                isRequired={true}
                descriptiveText="Must be globally unique and DNS compliant"
                hasError={!!error && !creationSuccess}
                size="large"
                flex="1"
              />

              <Button
                variation="link"
                onClick={generateBucketName}
                isDisabled={creationSuccess || isCreating}
                size="large"
              >
                Generate
              </Button>
            </Flex>

            {!creationSuccess && (
              <Button
                variation="primary"
                onClick={handleCreateBucket}
                isLoading={isCreating}
                loadingText="Creating bucket..."
                isDisabled={!bucketName || !!error}
                size="large"
              >
                Create S3 Bucket
              </Button>
            )}

            {creationSuccess && (
              <Alert
                variation="success"
                isDismissible={false}
                hasIcon={true}
                heading="Bucket Created Successfully"
              >
                S3 bucket "{bucketName}" is ready for document uploads.
              </Alert>
            )}
          </Flex>
        </Card>

        {/* Document Upload */}
        {creationSuccess && (
          <Card
            variation="outlined"
            padding={tokens.space.large}
            borderRadius={tokens.radii.medium}
          >
            <Flex direction="column" gap={tokens.space.medium}>
              <Flex alignItems="center" gap={tokens.space.small}>
                <Heading level={5}>2. Upload PDF Documents</Heading>
                {uploadedFiles.length > 0 && (
                  <Badge variation="info" size="small">
                    {uploadedFiles.length} file
                    {uploadedFiles.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </Flex>

              <Text
                fontSize={tokens.fontSizes.small}
                color={tokens.colors.font.secondary}
              >
                Upload PDF documents that will be used to create your knowledge
                base
              </Text>

              {/* Drop Zone */}
              <DropZone
                acceptedFileTypes={["application/pdf"]}
                onDropComplete={handleDropZoneFiles}
                padding={tokens.space.large}
                borderRadius={tokens.radii.medium}
                borderWidth={tokens.borderWidths.small}
                borderStyle="dashed"
                borderColor={tokens.colors.neutral[40]}
                backgroundColor={tokens.colors.background.secondary}
                textAlign="center"
                isDisabled={isUploading}
              >
                <Flex
                  direction="column"
                  alignItems="center"
                  gap={tokens.space.small}
                >
                  <Icon
                    ariaLabel="Upload"
                    pathData="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                    viewBox={{ width: 24, height: 24 }}
                    fontSize={tokens.fontSizes.xxxl}
                    color={tokens.colors.neutral[60]}
                  />

                  <Text fontWeight={tokens.fontWeights.semibold}>
                    Drag and drop PDF files here
                  </Text>

                  <Text
                    fontSize={tokens.fontSizes.small}
                    color={tokens.colors.font.secondary}
                  >
                    or
                  </Text>

                  <Button
                    size="small"
                    onClick={() => hiddenFileInput.current?.click()}
                    isDisabled={isUploading}
                  >
                    Browse Files
                  </Button>

                  <Text
                    fontSize={tokens.fontSizes.xs}
                    color={tokens.colors.font.secondary}
                  >
                    Only PDF files are accepted • Max 10 files
                  </Text>
                </Flex>

                <VisuallyHidden>
                  <input
                    ref={hiddenFileInput}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileInputChange}
                    tabIndex={-1}
                  />
                </VisuallyHidden>
              </DropZone>

              {/* Upload Progress */}
              {isUploading && (
                <Card
                  backgroundColor={tokens.colors.blue[10]}
                  padding={tokens.space.medium}
                >
                  <Flex alignItems="center" gap={tokens.space.small}>
                    <Loader size="small" />
                    <View flex="1">
                      <Text
                        fontSize={tokens.fontSizes.small}
                        fontWeight={tokens.fontWeights.semibold}
                      >
                        Uploading files... {uploadProgress}%
                      </Text>
                      <View
                        backgroundColor={tokens.colors.blue[20]}
                        borderRadius={tokens.radii.small}
                        height="4px"
                        marginTop={tokens.space.xs}
                      >
                        <View
                          backgroundColor={tokens.colors.blue[60]}
                          height="100%"
                          width={`${uploadProgress}%`}
                          borderRadius={tokens.radii.small}
                          style={{ transition: "width 0.3s ease" }}
                        />
                      </View>
                    </View>
                  </Flex>
                </Card>
              )}

              {/* Uploaded Files Table */}
              {uploadedFiles.length > 0 && (
                <View>
                  <Heading level={6} marginBottom={tokens.space.small}>
                    Uploaded Documents
                  </Heading>

                  <Table highlightOnHover={true}>
                    <TableHead>
                      <TableRow>
                        <TableCell as="th">File Name</TableCell>
                        <TableCell as="th">Size</TableCell>
                        <TableCell as="th">Uploaded</TableCell>
                        <TableCell as="th">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {uploadedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>
                            <Flex alignItems="center" gap={tokens.space.xs}>
                              <Icon
                                ariaLabel="PDF"
                                pathData="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                                viewBox={{ width: 24, height: 24 }}
                                color={tokens.colors.red[60]}
                              />
                              <Text>{file.name}</Text>
                            </Flex>
                          </TableCell>
                          <TableCell>{formatFileSize(file.size)}</TableCell>
                          <TableCell>
                            <Text fontSize={tokens.fontSizes.small}>
                              {file.lastModified.toLocaleTimeString()}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Button
                              variation="link"
                              size="small"
                              onClick={() => handleRemoveFile(file.id)}
                              color={tokens.colors.red[60]}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </View>
              )}
            </Flex>
          </Card>
        )}

        {/* Navigation */}
        <Flex justifyContent="space-between" marginTop={tokens.space.medium}>
          <Button onClick={onBack} variation="link" size="large">
            ← Back to Project Setup
          </Button>

          <Button
            type="submit"
            variation="primary"
            size="large"
            isDisabled={!creationSuccess || uploadedFiles.length === 0}
          >
            Continue to Vector Database →
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export default DocumentStorage;
