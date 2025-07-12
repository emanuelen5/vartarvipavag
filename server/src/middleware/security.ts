import { Request, Response, NextFunction } from 'express';

export interface SecurityConfig {
  enableApiKey?: boolean;
  apiKey?: string;
  allowedIPs?: string[];
}

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      enableApiKey: config.enableApiKey || false,
      apiKey: config.apiKey || process.env.API_KEY,
      allowedIPs: config.allowedIPs || ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost']
    };
  }

  public localhostOnly = (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = this.getClientIP(req);

    console.log(`Write request from IP: ${clientIP}`);
    
    // Check if the request has proxy headers (indicating it came from outside)
    const hasProxyHeaders = req.headers['x-forwarded-for'] || req.headers['x-real-ip'];
    if (hasProxyHeaders) {
      res.status(403).json({ 
        success: false, 
        error: 'Write operations are restricted to internal network only' 
      });
      return;
    }

    // Check API key if enabled
    if (this.config.enableApiKey && this.config.apiKey) {
      const providedKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
      
      if (!providedKey || providedKey !== this.config.apiKey) {
        res.status(401).json({ 
          success: false, 
          error: 'Invalid or missing API key' 
        });
        return;
      }
    }

    next();
  };

  private getClientIP(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  private isAllowedIP(clientIP: string): boolean {
    // Handle different IP formats
    const normalizedIP = clientIP.replace(/^::ffff:/, '');
    
    return this.config.allowedIPs!.some(allowedIP => 
      allowedIP === normalizedIP || 
      allowedIP === clientIP ||
      (allowedIP === 'localhost' && ['127.0.0.1', '::1'].includes(normalizedIP))
    );
  }
}

// Default instance
export const securityMiddleware = new SecurityMiddleware({
  enableApiKey: process.env.ENABLE_API_KEY_AUTH === 'true',
  apiKey: process.env.API_KEY,
  allowedIPs: process.env.ALLOWED_IPS?.split(',') || undefined
}); 