import { NextFunction, Request, Response } from 'express';

export interface SecurityConfig {
  apiKey?: string;
  allowedIPs?: string[];
}

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig = {}) {
    this.config = {
      apiKey: config.apiKey || process.env.API_KEY,
      allowedIPs: config.allowedIPs || ['127.0.0.1', '::1', '::ffff:127.0.0.1', 'localhost']
    };
  }

  public onlyInternalNetwork = (req: Request, res: Response, next: NextFunction): void => {
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

    next();
  };

  public validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    // Check API key if enabled
    if (this.config.apiKey) {
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
}

// Default instance
export const securityMiddleware = new SecurityMiddleware({
  apiKey: process.env.API_KEY,
  allowedIPs: process.env.ALLOWED_IPS?.split(',') || undefined
});