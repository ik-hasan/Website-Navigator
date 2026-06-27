# 🤖 Agentic Website Testing System

> **Production-ready full-stack MERN application** for AI-driven autonomous website testing using Google Gemini and Playwright.

Transform natural language instructions into automated browser tests with AI-powered planning, real-time execution logs, and comprehensive visual reports.

---

## ✨ Features

- 🧠 **AI-Powered Test Planning** - Convert natural language to structured test steps using Google Gemini
- 🎭 **Browser Automation** - Execute tests with Playwright (navigate, click, type, verify)
- 📸 **Screenshot Capture** - Automatic screenshots after every step
- 📊 **Real-time Logs** - Live WebSocket streaming of execution status
- 📄 **Structured Reports** - MongoDB-backed reports with step-by-step breakdowns
- 🔌 **Pluggable LLM Architecture** - Easy switching between AI models
- 🎨 **Modern UI** - Professional React interface with Tailwind CSS
- 🚀 **Production Ready** - Clean architecture, error handling, and scalability

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Frontend │─────▶│  Express Backend │─────▶│  MongoDB        │
│  (Vite)         │      │  (Node.js)       │      │  (Reports)      │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │
        │ WebSocket (Socket.io)   │
        └─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                            │
            ┌───────▼────────┐         ┌────────▼────────┐
            │  Google Gemini │         │   Playwright    │
            │  (LLM Service) │         │  (Automation)   │
            └────────────────┘         └─────────────────┘
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** v6 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Google Gemini API Key** ([Get API Key](https://makersuite.google.com/app/apikey))

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Navigate to project directory
cd new-agent

# Install backend dependencies
cd server
npm install

# Install Playwright browsers
npx playwright install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/agentic-tester

# Google Gemini API Key (REQUIRED)
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

**🔑 Get Your Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it into `.env`

### 3. Start MongoDB

```bash
# Windows - Start MongoDB service
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Verify MongoDB is running:
```bash
mongosh
# Should connect to MongoDB shell
```

### 4. Run the Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

Expected output:
```
MongoDB connected successfully
 Server running on port 5000
 API available at http://localhost:5000/api
 WebSocket ready for connections
```

**Terminal 2 - Frontend Dev Server:**
```bash
cd client
npm run dev
```

Expected output:
```
  VITE v5.0.12  ready in 245 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Open Application

Navigate to **http://localhost:3000** in your browser.

---

## 📖 Usage Guide

### Creating Your First Test

1. **Enter Target URL**
   - Example: `https://example.com`

2. **Write Natural Language Instruction**
   ```
   Navigate to the homepage, click on "More information", 
   and verify the page contains the word "Example Domain"
   ```

3. **Configure Options**
   - **AI Model**: Select `Google Gemini 1.5 Flash`
   - **Browser Mode**: Check `Run in headless mode` for background execution

4. **Execute Test**
   - Click `🚀 Execute Test`
   - Watch real-time logs stream in
   - View screenshots as they're captured
   - Get final report with session ID

5. **View Reports**
   - Navigate to **Reports** page
   - Click on any report to view detailed breakdown
   - Download as PDF for sharing

---

## 🧪 Sample Test Instructions

### Example 1: Basic Navigation
```
Navigate to https://www.wikipedia.org, type "Artificial Intelligence" 
in the search box, press Enter, and verify the page title contains "AI"
```

### Example 2: Form Submission
```
Go to https://example.com/contact, fill in the name field with "John Doe", 
email with "john@example.com", type a message, and verify submission success
```

### Example 3: Multi-Step Flow
```
Visit https://example.com, click "Products", select the first product, 
add it to cart, and verify the cart shows 1 item
```

---

## 🛠️ API Documentation

### Execute Test
**POST** `/api/execute`

Request body:
```json
{
  "url": "https://example.com",
  "instruction": "Click on About and verify the page loads",
  "model": "gemini",
  "headless": true
}
```

Response:
```json
{
  "sessionId": "a3f8d1c2-4e9a-...",
  "finalStatus": "success",
  "summary": "Executed 3 steps. Success: 3, Failed: 0",
  "stepsCount": 3
}
```

### Get Report
**GET** `/api/report/:sessionId`

Returns full report with steps and screenshots.

### List All Reports
**GET** `/api/reports?page=1&limit=20`

Returns paginated list of all reports.

---

## 📁 Project Structure

```
new-agent/
├── server/                     # Backend (Node.js + Express)
│   ├── controllers/           # Request handlers
│   │   ├── testController.js  # Test execution logic
│   │   └── reportController.js # Report retrieval
│   ├── models/                # MongoDB schemas
│   │   └── Report.js          # Report model
│   ├── routes/                # API routes
│   │   └── api.js            
│   ├── services/              # Business logic
│   │   ├── llm/              # LLM integrations
│   │   │   ├── gemini.service.js
│   │   │   └── index.js       # LLM factory
│   │   └── automation/        # Browser automation
│   │       └── playwright.engine.js
│   ├── reports/               # Generated screenshots
│   ├── server.js              # Entry point
│   └── package.json          
│
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── LogConsole.jsx
│   │   │   └── ScreenshotGallery.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── ReportViewer.jsx
│   │   ├── services/         # API & WebSocket
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── App.jsx           # Main app
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example               # Environment template
├── .gitignore
└── README.md                  # This file
```

---

## 🔧 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool (faster than webpack)
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io Client** - Real-time WebSocket

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **Socket.io** - WebSocket server
- **Playwright** - Browser automation
- **@google/generative-ai** - Gemini SDK

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not, start MongoDB service
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Playwright Installation Issues
```bash
# Reinstall Playwright browsers
cd server
npx playwright install --force
```

### Gemini API Key Errors
- Verify your API key is correct in `.env`
- Check quota at [Google AI Studio](https://makersuite.google.com/)
- Ensure no extra spaces in `.env` file

### Port Already in Use
```bash
# Change ports in:
# - server/.env (PORT=5001)
# - client/vite.config.js (server.port: 3001)
```

### WebSocket Connection Failed
- Ensure both frontend and backend are running
- Check CORS configuration in `server/server.js`
- Verify proxy settings in `client/vite.config.js`

---

## 🎯 Future Enhancements

- [ ] OpenAI GPT-4 integration
- [ ] Local LLM support (Ollama)
- [ ] Smart selector fallback mechanisms
- [ ] Test retry logic with exponential backoff
- [ ] Screenshot compression (WebP)
- [ ] Dark mode UI toggle
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Test scheduling
- [ ] Slack/Email notifications

---

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 🙋 Support

For issues and questions:
1. Check the **Troubleshooting** section above
2. Review MongoDB, Playwright, and Gemini API documentation
3. Ensure all environment variables are correctly set

---

**Built with ❤️ using AI-powered development**