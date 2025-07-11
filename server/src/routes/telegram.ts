import { Router, Request, Response } from 'express';
import { TelegramBotService } from '../services/TelegramBot';
import { ApiResponse } from '../types';

const router = Router();

// Telegram bot service instance (will be initialized by server)
let telegramBot: TelegramBotService | null = null;

// Initialize telegram bot service
export const initializeTelegramBot = (botService: TelegramBotService): void => {
  telegramBot = botService;
};

// GET /api/telegram/status - Check bot status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const isInitialized = telegramBot?.isInitialized() || false;
    const isPollingActive = telegramBot?.isPollingActive() || false;
    
    const response: ApiResponse<{ 
      initialized: boolean; 
      polling: boolean;
      mode: string;
    }> = {
      success: true,
      data: { 
        initialized: isInitialized,
        polling: isPollingActive,
        mode: 'polling'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting Telegram bot status:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get bot status'
    };
    
    res.status(500).json(response);
  }
});

export default router; 