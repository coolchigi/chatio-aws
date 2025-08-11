import { Router, Request, Response } from 'express';
import { assumeRoleAndCache, clearSession, getCacheStats } from '../services/stsService';
import { AssumeRoleRequest, AssumeRoleResponse, LogoutRequest } from '../types/aws';

const router = Router();

/**
 * POST /api/auth/assume-role
 * Assumes an IAM role and returns a session ID for cached credentials
 */
router.post('/assume-role', async (req: Request<{}, AssumeRoleResponse, AssumeRoleRequest>, res: Response<AssumeRoleResponse>) => {
  try {
    const { roleArn } = req.body;

    // Validate request body
    if (!roleArn || typeof roleArn !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Role ARN is required and must be a string'
      });
    }

    // Trim whitespace (users might copy-paste with extra spaces)
    const trimmedRoleArn = roleArn.trim();

    if (!trimmedRoleArn) {
      return res.status(400).json({
        success: false,
        error: 'Role ARN cannot be empty'
      });
    }

    console.log(`Role assumption request for: ${trimmedRoleArn}`);

    // Attempt to assume the role
    const result = await assumeRoleAndCache(trimmedRoleArn);

    if (result.success) {
      return res.status(200).json({
        success: true,
        sessionId: result.sessionId,
        expiresAt: result.expiresAt?.toISOString()
      });
    } else {
      // Return client error for role assumption failures
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

  } catch (error: any) {
    console.error('Unexpected error in assume-role endpoint:', error);
    
    // Return generic error for unexpected failures
    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred while assuming role'
    });
  }
});

/**
 * POST /api/auth/logout
 * Clears a session and removes cached credentials
 */
router.post('/logout', (req: Request<{}, {}, LogoutRequest>, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const cleared = clearSession(sessionId);
    
    console.log(`Logout request for session: ${sessionId}, cleared: ${cleared}`);

    return res.status(200).json({
      success: true,
      message: cleared ? 'Session cleared successfully' : 'Session not found (may have already expired)'
    });

  } catch (error: any) {
    console.error('Error in logout endpoint:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred during logout'
    });
  }
});

/**
 * GET /api/auth/status
 * Returns session status and cache statistics (for debugging)
 */
router.get('/status', (_req: Request, res: Response) => {
  try {
    const stats = getCacheStats();
    
    return res.status(200).json({
      success: true,
      cacheStats: stats,
      serverTime: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error in status endpoint:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error occurred while getting status'
    });
  }
});

export default router;
