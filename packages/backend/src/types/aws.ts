// Shared AWS TypeScript interfaces for backend services

/**
 * AWS temporary credentials structure returned by STS
 */
export interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration: Date;
}

/**
 * Session data stored in backend cache
 */
export interface SessionData {
  credentials: AWSCredentials;
  roleArn: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Result from STS role assumption operation
 */
export interface AssumeRoleResult {
  success: boolean;
  sessionId?: string;
  error?: string;
  expiresAt?: Date;
}

/**
 * Request and response types for assume role operations
 */
export interface AssumeRoleRequest {
  roleArn: string;
}

/**
 * Response structure for assume role operations
  * Contains session ID and expiration time if successful
  * or an error message if failed
 */
export interface AssumeRoleResponse {
  success: boolean;
  sessionId?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Request structure for logging out a session
 */
export interface LogoutRequest {
  sessionId: string;
}