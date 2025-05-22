# VisionMeet - AI-Supported Video Conferencing Platform

VisionMeet is a secure, scalable video conferencing platform that integrates AI capabilities to enhance communication and post-meeting productivity.

## 🚀 Features

- Real-time video conferencing with WebRTC
- Live transcription using AWS Transcribe
- AI-powered meeting summaries with GPT-4
- Emotion detection using Azure Cognitive Services
- Real-time chat and screen sharing
- Speaker analytics and insights

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js (Express) + Socket.IO
- **Video Engine**: WebRTC (via simple-peer)
- **Database**: MongoDB Atlas + Redis
- **AI Integration**: 
  - AWS Transcribe
  - GPT-4
  - Azure Emotion API
- **Infrastructure**:
  - AWS ECS (Fargate)
  - S3 + CloudFront
  - Docker + Kubernetes
  - Terraform
  - GitHub Actions CI/CD

## 📦 Project Structure

```
visionmeet/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── infrastructure/         # Terraform configurations
├── docker/                 # Docker configurations
└── .github/               # GitHub Actions workflows
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker
- AWS Account
- Azure Account
- MongoDB Atlas Account

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/visionmeet.git
   cd visionmeet
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Start development environment:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests
cd server && npm test
```

## 📝 License

MIT License - see LICENSE file for details 