# Bridge Game

A modern web-based Contract Bridge game with React frontend and FastAPI backend.

## Features

- **Full Contract Bridge Implementation**: Complete bidding (auction) and play phases
- **Real-time Multiplayer**: WebSocket-based real-time game state synchronization
- **AI Players**: Intelligent AI for bidding and card play
- **Beautiful UI**: Modern card game interface with authentic bridge table layout
- **Scoring System**: Accurate Contract Bridge scoring with vulnerability tracking
- **Multiple Rounds**: Complete rubber bridge gameplay

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Styled Components** for styling
- **Axios** for HTTP requests
- **WebSocket** for real-time updates

### Backend
- **FastAPI** with Python 3.8+
- **WebSocket** for real-time communication
- **Pydantic** for data validation
- **Google Generative AI** (optional, for advanced AI)

## Project Structure

```
bridgereact/
├── backend/           # FastAPI backend
│   ├── models/        # Game logic and data models
│   ├── main.py        # FastAPI application
│   ├── requirements.txt
│   └── .env           # Environment variables
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API services
│   │   └── types/       # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── venv/              # Python virtual environment
├── setup.sh           # Setup script
└── start_dev.sh       # Development server launcher
```

## Quick Start

1. **Setup the project**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Start development servers**:
   ```bash
   ./start_dev.sh
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Manual Setup

### Backend Setup

1. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

## Game Rules

This implementation follows standard Contract Bridge rules:

1. **Partnership**: North-South vs East-West partnerships
2. **Dealing**: Cards are dealt clockwise starting from dealer's left
3. **Auction**: Players bid for trump suit and level
4. **Play**: 13 tricks played with trump suit advantage
5. **Scoring**: Standard Contract Bridge scoring with vulnerability

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Optional: Google Generative AI API Key for advanced AI
GOOGLE_API_KEY=your_google_api_key_here

# Development settings
DEBUG=True
```

### API Endpoints

- `POST /api/games` - Create new game
- `GET /api/games/{game_id}` - Get game state
- `POST /api/games/{game_id}/start` - Start game
- `POST /api/games/{game_id}/deal` - Deal cards
- `POST /api/games/{game_id}/auction` - Make bid
- `POST /api/games/{game_id}/play` - Play card
- `POST /api/games/{game_id}/ai_action` - AI action
- `WebSocket /ws/{game_id}` - Real-time updates

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `main.py` and game logic in `models/`
2. **Frontend**: Add new components in `src/components/` and update types in `src/types/`

### Testing

- Backend: `pytest` (test files to be added)
- Frontend: `npm test` (test files to be added)

## Deployment

### Production Build

1. **Frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Backend**:
   ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### Docker (Optional)

Docker configuration files can be added for containerized deployment.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

This project is licensed under the MIT License.

## Security

- No sensitive data (API keys, passwords) should be committed to version control
- Use environment variables for configuration
- Validate all user inputs
- Use HTTPS in production

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in configuration files
2. **CORS errors**: Check CORS settings in backend
3. **WebSocket connection failed**: Verify WebSocket URL and proxy settings
4. **AI not working**: Check Google API key configuration

### Support

For issues and questions, please create an issue on the GitHub repository.
