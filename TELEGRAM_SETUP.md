# 🤖 Telegram Bot Setup Guide

This guide will help you set up a Telegram bot for your Interrail Journey Tracker, allowing you to update your travel map directly from Telegram!

The bot uses **polling** instead of webhooks, which means it works completely locally without needing a public endpoint or external connectivity.

## 📱 What You Can Do with the Telegram Bot

- **📍 Share locations** → Automatically add new positions to your journey
- **💬 Send messages** → Add notes to your latest position
- **📊 Get stats** → View your journey statistics
- **🗺️ Quick access** → Get direct links to your map

## 🚀 Step 1: Create Your Telegram Bot

### 1. Start a chat with BotFather
1. Open Telegram and search for `@BotFather`
2. Start a conversation with `/start`

### 2. Create a new bot
```
/newbot
```

### 3. Choose a name and username
- **Bot Name**: `Your Interrail Tracker` (can be anything)
- **Bot Username**: `your_interrail_bot` (must end with 'bot' and be unique)

### 4. Save your bot token
BotFather will give you a token like:
```
123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```
**⚠️ Keep this token secret!**

## ⚙️ Step 2: Configure Your Server

### 1. Add environment variables
Create or update your `server/.env` file:

```env
# Existing configuration...
PORT=3001
CLIENT_URL=http://localhost:3000

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
# Optional: Polling interval (milliseconds, default: 1000)
TELEGRAM_POLLING_INTERVAL=1000
```

### 2. Restart your server
```bash
npm run dev
```

You should see:
```
✅ Telegram bot initialized successfully
🚀 Telegram bot polling started
```

## 📞 Step 3: Test Your Bot

### 1. Find your bot in Telegram
- Search for your bot username (e.g., `@your_interrail_bot`)
- Start a conversation

### 2. Send `/start`
You should receive:
```
🚂 Welcome to your Interrail Journey Tracker!

I can help you update your travel map with notes and locations.

📍 Share your location to add a new stop
💬 Send any text to add a note to your latest position
📊 Use /stats to see your journey statistics
❓ Use /help for more commands

🗺️ View your journey: http://localhost:3000
```

### 3. Test basic functionality
- Send a message like `"Having amazing time in the city!"`
- If you have positions, it will add a note to your latest location
- Use `/stats` to see your journey statistics

## 🌍 Step 4: Using Your Bot While Traveling

### Adding Locations
**Option 1: Share Live Location**
1. Tap the attachment icon (📎) in Telegram
2. Choose "Location"
3. Select "Share Live Location" or "Send Current Location"

**Option 2: Share Any Location**
1. Open Maps in Telegram
2. Find any location
3. Tap "Send Selected Location"

### Adding Notes
Simply send any text message:
```
"Amazing sunset from the hotel balcony! 🌅"
"Just tried the best gelato ever!"
"Train is delayed but the views are incredible"
```

### Bot Commands
- `/start` - Welcome message
- `/help` - Show available commands
- `/stats` - Your journey statistics
- `/latest` - Show your latest position

## ⚙️ Step 5: Configuration Options

### Polling Interval
You can adjust how often the bot checks for new messages:

```env
# Check every 500ms (more responsive, more API calls)
TELEGRAM_POLLING_INTERVAL=500

# Check every 2 seconds (less responsive, fewer API calls)
TELEGRAM_POLLING_INTERVAL=2000
```

### Check Bot Status
Verify your bot is running:
```bash
curl http://localhost:3001/api/telegram/status
```

Response should show:
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "polling": true,
    "mode": "polling"
  }
}
```

## 🔧 Troubleshooting

### Bot not responding?
1. **Check bot token**: Make sure it's correct in `.env`
2. **Check server logs**: Look for Telegram-related errors
3. **Restart server**: After changing environment variables
4. **Test bot status**: `curl http://localhost:3001/api/telegram/status`
5. **Check internet connection**: Polling requires internet access

### Can't add notes?
1. **Need positions first**: Share a location before sending text notes
2. **Check latest position**: Use `/latest` command to verify

### Polling issues?
1. **Internet connection**: Bot needs internet to poll Telegram API
2. **API rate limits**: If polling too frequently, increase interval
3. **Check server logs**: Look for "polling_error" messages
4. **Restart server**: Sometimes helps reset polling connection

## 🎯 Tips for Best Experience

### 📍 Location Sharing
- **Enable location services** for accurate positioning
- **Share frequently** to create a detailed travel route
- **Use descriptive location names** in your device

### 💬 Note Taking
- **Add context**: Include what you're doing, seeing, feeling
- **Use emojis**: Make your notes more expressive 🎉
- **Regular updates**: Share moments throughout the day

### 📊 Track Your Journey
- Use `/stats` regularly to see your progress
- Check the web map for visual overview
- Share the map URL with friends and family

## 🔐 Security Notes

- **Keep bot token private**: Never share or commit it to version control
- **Bot only works from your server**: Write operations are localhost-only
- **No public endpoints**: Polling means no external webhooks or ports needed
- **Local operation**: Everything runs on your machine, no cloud dependencies
- **No sensitive data**: Don't share passwords or personal info via bot

## 📱 Example Usage

```
You: 📍 [Share Location: Paris, France]
Bot: ✅ Location added to your interrail journey!
     📍 Coordinates: 48.8566, 2.3522
     🕐 Time: 2024-07-11 15:30:00
     View on your map: http://localhost:3000

You: Just arrived at the Eiffel Tower! The view is incredible! 🗼✨

Bot: ✅ Note added to your latest position!
     📍 Location: Paris, France
     💬 Note: "Just arrived at the Eiffel Tower! The view is incredible! 🗼✨"
     🕐 Time: 2024-07-11 15:35:00
     View on your map: http://localhost:3000

You: /stats

Bot: 📊 Your Interrail Journey Stats:
     🛤️ Total Distance: 1,234.5 km
     🇪🇺 Countries: 5
     🏙️ Cities: 12
     📍 Positions: 28
     📅 Duration: 14 days
     ⚡ Avg Speed: 88.2 km/day
     🗺️ View full map: http://localhost:3000
```

## 🎉 Enjoy Your Journey!

Your Telegram bot is now ready to capture every moment of your interrail adventure! 

- 🚂 **Track your route** in real-time
- 📝 **Document experiences** instantly  
- 📊 **See your progress** with statistics
- 🗺️ **Share your journey** with others

**Happy traveling!** 🇪🇺✨

---

For technical support or feature requests, check the main [README.md](./README.md) file. 