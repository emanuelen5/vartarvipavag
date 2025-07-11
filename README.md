# 🚂 Interrail Journey Tracker

A fullstack web application for tracking and visualizing your European interrail adventure in real-time. Built with React + TypeScript (frontend) and Node.js + Express + SQLite (backend).

## 🌟 Features

- **Real-time Map Visualization**: Interactive map of Europe showing your journey
- **Journey Statistics**: Track distance, countries visited, duration, and more  
- **Secure API**: Write operations restricted to localhost (for Home Assistant integration)
- **Modern UI**: Beautiful, responsive design with real-time updates
- **Travel History**: Complete timeline of your adventure
- **🤖 Telegram Bot Integration**: Update your journey directly from Telegram
- **📝 Smart Notes System**: Add contextual notes from multiple sources
- **📱 Mobile-Friendly**: Easy updates while traveling

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- React-Leaflet for interactive maps
- Axios for API communication
- Vite for fast development

### Backend
- Node.js + Express with TypeScript
- SQLite database for position storage
- Socket.IO for real-time updates
- CORS configuration for security

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vartarvipavag
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the development environment**
   ```bash
   npm run dev
   ```

   This will start both the server (port 3001) and client (port 3000) concurrently.

## 🚀 Usage

### Frontend (Web Interface)
- Open http://localhost:3000 in your browser
- View your journey on the interactive map
- See real-time statistics and travel data
- Click on markers for detailed position information

### Backend API
- Server runs on http://localhost:3001
- API endpoints available at `/api/positions`
- Health check: http://localhost:3001/health

## 🔐 Security

The API implements a security model where:
- **Read operations** (GET): Available to all clients
- **Write operations** (POST, PUT, DELETE): Restricted to localhost only

This ensures that only your local Home Assistant instance can add position data, while the web interface can be accessed from anywhere.

## 📍 API Endpoints

### Public Endpoints (Read Access)
- `GET /api/positions` - Get all positions
- `GET /api/positions/:id` - Get specific position
- `GET /health` - Health check

### Localhost-Only Endpoints (Write Access)
- `POST /api/positions` - Add new position
- `PUT /api/positions/:id` - Update position
- `DELETE /api/positions/:id` - Delete position
- `POST /api/positions/:id/notes` - Add note to position

### Additional Endpoints
- `GET /api/positions/latest` - Get latest position
- `GET /api/telegram/status` - Check Telegram bot status

### Example Position Data
```json
{
  "latitude": 59.3293,
  "longitude": 18.0686,
  "city": "Stockholm",
  "country": "Sweden",
  "notes": "Beautiful sunset at the harbor!"
}
```

## 🤖 Telegram Bot Integration

**NEW!** Send updates directly from Telegram while traveling! The bot uses **polling** instead of webhooks, which means it works completely locally without needing a public endpoint.

### Quick Setup
1. **Create bot**: Message `@BotFather` on Telegram
2. **Get token**: Save the bot token from BotFather  
3. **Configure**: Add `TELEGRAM_BOT_TOKEN=your_token` to `server/.env`
4. **Start server**: The bot will automatically start polling for messages
5. **Start using**: Share locations and send notes via Telegram!

### What You Can Do
- **📍 Share Location**: Auto-add positions to your map
- **💬 Send Messages**: Add notes to your latest position  
- **📊 Get Stats**: View journey statistics
- **🗺️ Quick Links**: Direct access to your map

### How It Works
- **🔄 Polling**: Server checks for new messages every second (configurable)
- **🔐 Secure**: No public endpoints needed - everything runs locally
- **📱 Real-time**: Messages are processed as soon as they're received

**👉 See [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for detailed setup guide**

## 🏠 Home Assistant Integration

The API is designed to work with Home Assistant. To integrate:

1. **Set up location tracking** in Home Assistant
2. **Create automation** to POST to `http://localhost:3001/api/positions`
3. **Optional**: Use API key authentication (set `ENABLE_API_KEY_AUTH=true`)

Example Home Assistant automation:
```yaml
alias: "Track Interrail Position"
trigger:
  - platform: state
    entity_id: device_tracker.your_phone
action:
  - service: rest_command.log_position
    data:
      latitude: "{{ states.device_tracker.your_phone.attributes.latitude }}"
      longitude: "{{ states.device_tracker.your_phone.attributes.longitude }}"
      city: "{{ states.sensor.your_location.state }}"
      country: "{{ states.sensor.your_country.state }}"
```

## ⚙️ Configuration

### Environment Variables (Optional)

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3001
CLIENT_URL=http://localhost:3000

# Security Configuration
ENABLE_API_KEY_AUTH=false
API_KEY=your-secret-api-key-here
ALLOWED_IPS=127.0.0.1,localhost,::1

# Database Configuration
DATABASE_PATH=./data/interrail.db

# Telegram Bot Configuration (Optional)
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_POLLING_INTERVAL=1000  # milliseconds, how often to check for new messages
```

## 🗂️ Project Structure

```
vartarvipavag/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service
│   │   ├── types/         # TypeScript types
│   │   └── ...
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Security middleware
│   │   ├── types/         # TypeScript types
│   │   └── ...
│   └── package.json
└── package.json           # Root scripts
```

## 📊 Development Scripts

```bash
# Start both client and server
npm run dev

# Start only server
npm run server:dev

# Start only client
npm run client:dev

# Build for production
npm run server:build
npm run client:build

# Install all dependencies
npm run install:all
```

## 🌍 Map Features

- **Interactive Map**: Pan, zoom, and explore Europe
- **Journey Path**: Dashed line connecting all positions
- **Smart Markers**: Different colors for start (green), current (red), and stops (blue)
- **Detailed Popups**: Click markers for position details
- **Auto-fit**: Map automatically adjusts to show all positions

## 📈 Statistics Tracking

- **Total Distance**: Calculated using haversine formula
- **Countries Visited**: Unique countries from position data
- **Cities Visited**: Unique cities from position data
- **Journey Duration**: Time between first and last position
- **Average Speed**: Daily travel distance

## 🔧 Troubleshooting

**Server won't start:**
- Check if port 3001 is available
- Verify SQLite database permissions
- Run `npm run server:dev` for detailed logs

**Client won't load:**
- Check if port 3000 is available
- Verify API proxy configuration
- Run `npm run client:dev` for detailed logs

**Map not loading:**
- Check internet connection (requires OpenStreetMap tiles)
- Verify Leaflet CSS is loading
- Check browser console for errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet for mapping library
- Home Assistant community for integration ideas
- React and Node.js communities for excellent tools

---

🚂 **Happy Interrailing!** 🇪🇺 