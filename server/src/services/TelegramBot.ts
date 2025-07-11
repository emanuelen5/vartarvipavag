import TelegramBot from 'node-telegram-bot-api';
import { PositionModel } from '../models/Position';
import { CreatePositionRequest, AddNoteRequest } from '../types';

export interface TelegramConfig {
  token: string;
  pollingInterval?: number; // milliseconds, defaults to 1000ms
}

export class TelegramBotService {
  private bot: TelegramBot | null = null;
  private positionModel: PositionModel;
  private config: TelegramConfig;
  private isPolling: boolean = false;

  constructor(config: TelegramConfig) {
    this.config = config;
    this.positionModel = new PositionModel();
  }

  public initialize(): void {
    if (!this.config.token) {
      console.log('⚠️  Telegram bot token not provided, skipping bot initialization');
      return;
    }

    try {
      // Initialize bot with polling enabled
      this.bot = new TelegramBot(this.config.token, { 
        polling: {
          interval: this.config.pollingInterval || 1000,
          autoStart: false
        }
      });

      // Set up message handlers
      this.setupMessageHandlers();
      
      console.log('✅ Telegram bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error);
    }
  }

  public async startPolling(): Promise<void> {
    if (!this.bot) {
      throw new Error('Bot not initialized');
    }

    if (this.isPolling) {
      console.log('📱 Telegram bot polling already started');
      return;
    }

    try {
      await this.bot.startPolling();
      this.isPolling = true;
      console.log('🚀 Telegram bot polling started');
    } catch (error) {
      console.error('❌ Failed to start polling:', error);
      throw error;
    }
  }

  public async stopPolling(): Promise<void> {
    if (!this.bot || !this.isPolling) {
      return;
    }

    try {
      await this.bot.stopPolling();
      this.isPolling = false;
      console.log('⏹️  Telegram bot polling stopped');
    } catch (error) {
      console.error('❌ Failed to stop polling:', error);
      throw error;
    }
  }

  private setupMessageHandlers(): void {
    if (!this.bot) return;

    // Handle location messages
    this.bot.on('location', async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const username = msg.from?.username || msg.from?.first_name || 'Unknown';

      try {
        if (msg.location) {
          await this.handleLocationMessage(chatId, msg.location, username);
        }
      } catch (error) {
        console.error('Error handling location message:', error);
        await this.sendMessage(chatId, '❌ Sorry, something went wrong processing your location.');
      }
    });

    // Handle text messages
    this.bot.on('message', async (msg) => {
      // Skip if it's a location message (handled above)
      if (msg.location) return;

      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const username = msg.from?.username || msg.from?.first_name || 'Unknown';

      try {
        if (msg.text) {
          await this.handleTextMessage(chatId, msg.text, username);
        }
      } catch (error) {
        console.error('Error handling text message:', error);
        await this.sendMessage(chatId, '❌ Sorry, something went wrong processing your message.');
      }
    });

    // Handle polling errors
    this.bot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error);
    });
  }

  private async handleLocationMessage(
    chatId: number, 
    location: { latitude: number; longitude: number }, 
    username: string
  ): Promise<void> {
    try {
      // Create new position from location
      const positionRequest: CreatePositionRequest = {
        latitude: location.latitude,
        longitude: location.longitude,
        source: 'telegram'
      };

      const position = await this.positionModel.create(positionRequest);

      // Add a note indicating this was shared via Telegram
      await this.positionModel.addNote(position.id, {
        text: `📍 Location shared via Telegram by ${username}`,
        source: 'telegram',
        telegram_user: username
      });

      await this.sendMessage(
        chatId, 
        `✅ Location added to your interrail journey!\n\n` +
        `📍 Coordinates: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}\n` +
        `🕐 Time: ${new Date().toLocaleString()}\n\n` +
        `View on your map: http://localhost:3000`
      );

    } catch (error) {
      console.error('Error handling location message:', error);
      await this.sendMessage(chatId, '❌ Failed to add location to your journey.');
    }
  }

  private async handleTextMessage(chatId: number, text: string, username: string): Promise<void> {
    const command = text.toLowerCase();

    // Handle commands
    if (command.startsWith('/')) {
      await this.handleCommand(chatId, command, username);
      return;
    }

    // Handle regular text messages as notes to latest position
    try {
      const latestPosition = await this.positionModel.getLatestPosition();
      
      if (!latestPosition) {
        await this.sendMessage(
          chatId, 
          '📍 No positions found yet! Share your location first or use /help for more options.'
        );
        return;
      }

      // Add note to latest position
      await this.positionModel.addNote(latestPosition.id, {
        text: text,
        source: 'telegram',
        telegram_user: username
      });

      const locationName = latestPosition.city 
        ? `${latestPosition.city}${latestPosition.country ? `, ${latestPosition.country}` : ''}`
        : `${latestPosition.latitude.toFixed(4)}, ${latestPosition.longitude.toFixed(4)}`;

      await this.sendMessage(
        chatId,
        `✅ Note added to your latest position!\n\n` +
        `📍 Location: ${locationName}\n` +
        `💬 Note: "${text}"\n` +
        `🕐 Time: ${new Date().toLocaleString()}\n\n` +
        `View on your map: http://localhost:3000`
      );

    } catch (error) {
      console.error('Error adding note:', error);
      await this.sendMessage(chatId, '❌ Failed to add note to your journey.');
    }
  }

  private async handleCommand(chatId: number, command: string, username: string): Promise<void> {
    switch (command) {
      case '/start':
        await this.sendWelcomeMessage(chatId);
        break;

      case '/help':
        await this.sendHelpMessage(chatId);
        break;

      case '/stats':
        await this.sendStatsMessage(chatId);
        break;

      case '/latest':
        await this.sendLatestPosition(chatId);
        break;

      default:
        await this.sendMessage(
          chatId, 
          `❓ Unknown command: ${command}\n\nUse /help to see available commands.`
        );
    }
  }

  private async sendWelcomeMessage(chatId: number): Promise<void> {
    const message = 
      `🚂 Welcome to your Interrail Journey Tracker!\n\n` +
      `I can help you update your travel map with notes and locations.\n\n` +
      `📍 Share your location to add a new stop\n` +
      `💬 Send any text to add a note to your latest position\n` +
      `📊 Use /stats to see your journey statistics\n` +
      `❓ Use /help for more commands\n\n` +
      `🗺️ View your journey: http://localhost:3000`;

    await this.sendMessage(chatId, message);
  }

  private async sendHelpMessage(chatId: number): Promise<void> {
    const message = 
      `🤖 Available Commands:\n\n` +
      `📍 Share Location - Add new position to your journey\n` +
      `💬 Send Text - Add note to your latest position\n` +
      `/stats - View journey statistics\n` +
      `/latest - Show your latest position\n` +
      `/help - Show this help message\n\n` +
      `🗺️ View your map: http://localhost:3000`;

    await this.sendMessage(chatId, message);
  }

  private async sendStatsMessage(chatId: number): Promise<void> {
    try {
      const positions = await this.positionModel.findAll();
      
      if (positions.length === 0) {
        await this.sendMessage(chatId, '📊 No journey data yet! Start by sharing your location.');
        return;
      }

      // Calculate statistics
      let totalDistance = 0;
      const countries = new Set<string>();
      const cities = new Set<string>();

      for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const current = positions[i];
        totalDistance += this.positionModel.calculateDistance(
          prev.latitude, prev.longitude,
          current.latitude, current.longitude
        );

        if (current.country) countries.add(current.country);
        if (current.city) cities.add(current.city);
      }

      const duration = positions.length > 1 
        ? Math.ceil((new Date(positions[positions.length - 1].timestamp).getTime() - 
                    new Date(positions[0].timestamp).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const message = 
        `📊 Your Interrail Journey Stats:\n\n` +
        `🛤️ Total Distance: ${totalDistance.toFixed(1)} km\n` +
        `🇪🇺 Countries: ${countries.size}\n` +
        `🏙️ Cities: ${cities.size}\n` +
        `📅 Duration: ${duration} days\n` +
        `📍 Total Stops: ${positions.length}\n\n` +
        `🗺️ View your journey: http://localhost:3000`;

      await this.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error getting stats:', error);
      await this.sendMessage(chatId, '❌ Failed to get journey statistics.');
    }
  }

  private async sendLatestPosition(chatId: number): Promise<void> {
    try {
      const latestPosition = await this.positionModel.getLatestPosition();
      
      if (!latestPosition) {
        await this.sendMessage(chatId, '📍 No positions found yet! Share your location first.');
        return;
      }

      const locationName = latestPosition.city 
        ? `${latestPosition.city}${latestPosition.country ? `, ${latestPosition.country}` : ''}`
        : `${latestPosition.latitude.toFixed(4)}, ${latestPosition.longitude.toFixed(4)}`;

      const message = 
        `📍 Your Latest Position:\n\n` +
        `🗺️ Location: ${locationName}\n` +
        `📊 Coordinates: ${latestPosition.latitude.toFixed(4)}, ${latestPosition.longitude.toFixed(4)}\n` +
        `🕐 Time: ${new Date(latestPosition.timestamp).toLocaleString()}\n\n` +
        `View on your map: http://localhost:3000`;

      await this.sendMessage(chatId, message);
    } catch (error) {
      console.error('Error getting latest position:', error);
      await this.sendMessage(chatId, '❌ Failed to get latest position.');
    }
  }

  private async sendMessage(chatId: number, text: string): Promise<void> {
    if (!this.bot) return;

    try {
      await this.bot.sendMessage(chatId, text);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  public isInitialized(): boolean {
    return this.bot !== null;
  }

  public isPollingActive(): boolean {
    return this.isPolling;
  }
} 