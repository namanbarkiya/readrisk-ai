# RiskRead AI - Project Documentation

## 📋 Project Overview

**RiskRead AI** is an AI-powered document analysis platform for instant risk scoring and insights.

**Tech Stack:** Next.js 15 + TypeScript + Supabase + Gemini AI + Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Gemini AI API key

### Setup Instructions

1. **Clone and Install**

   ```bash
   git clone <repository>
   cd readrisk-ai
   npm install
   ```

2. **Environment Variables**

   ```bash
   cp env-example.env .env.local
   ```

   Add your Supabase and Gemini AI credentials.

3. **Database Setup**
   - Go to Supabase Dashboard → SQL Editor
   - Run the contents of `scripts/setup-database.sql`

4. **Start Development**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
readrisk-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # React components
│   ├── analysis/          # Analysis components
│   ├── dashboard/         # Dashboard components
│   ├── ui/               # UI components
│   └── ...
├── lib/                  # Utilities and services
│   ├── services/         # Business logic
│   ├── supabase/         # Database client
│   ├── utils/            # Helper functions
│   └── ...
├── scripts/              # Database setup scripts
└── project-details/      # Documentation
```

## 🎯 Core Features

### ✅ Completed Features

#### **Phase 1: Foundation & Setup** ✅

- [x] Database schema and tables
- [x] User authentication system
- [x] User profile management
- [x] Row Level Security (RLS) policies
- [x] Supabase storage integration
- [x] Environment configuration

#### **Phase 2: Core Infrastructure** ✅

- [x] File upload system with drag & drop
- [x] File validation and preview
- [x] Upload progress tracking
- [x] Analysis service with Gemini AI integration
- [x] Scoring algorithms and risk assessment
- [x] API routes for analysis operations
- [x] Background processing system
- [x] Real-time status updates

#### **Testing & Development** ✅

- [x] Comprehensive testing page
- [x] Sample test documents
- [x] Error handling and validation
- [x] Progress tracking and status updates
- [x] PDF extraction testing with pdf-parse-new

### 🚧 In Progress / Next Steps

#### **Phase 3: State Management**

- [ ] Analysis store with Jotai
- [ ] React Query hooks for data fetching
- [ ] Real-time updates and caching

#### **Phase 4: UI Components**

- [ ] Analysis results display
- [ ] Score visualization components
- [ ] Document viewer integration
- [ ] History and management interface

#### **Phase 5: Advanced Features**

- [ ] Document viewer with highlights
- [ ] Export functionality
- [ ] Advanced analytics dashboard
- [ ] Sharing and collaboration features

## 🔧 Technical Architecture

### **Database Schema**

- `user_profiles` - User information and preferences
- `analyses` - Analysis records and metadata
- `analysis_results` - Detailed analysis results and scores

### **Key Components**

- **File Upload**: Drag & drop with validation
- **Analysis Engine**: Gemini AI integration with structured prompts
- **Scoring System**: 5-dimensional scoring (relevance, completeness, risk, clarity, accuracy)
- **Security**: Row Level Security and proper authentication

### **API Endpoints**

- `POST /api/analysis` - Create new analysis
- `GET /api/analysis` - Get analysis history
- `GET /api/analysis/[id]` - Get specific analysis
- `GET /api/analysis/[id]/status` - Get processing status
- `POST /api/upload` - File upload endpoint

## 🛠️ Development

### **Testing**

- Visit `/dashboard/test-analysis` for comprehensive testing
- Download sample documents for testing
- Real-time progress tracking and error handling

### **File Types Supported**

- PDF Documents (.pdf) - Using pdf-parse-new for reliable text extraction
- Word Documents (.docx) - Using mammoth for text extraction
- Excel Spreadsheets (.xlsx) - Basic text extraction
- Text Files (.txt) - Direct text extraction

### **File Requirements**

- Maximum size: 10MB
- Processing time: 15-30 seconds
- Supported languages: English

## 📊 Implementation Progress

**Overall Progress: ~40% Complete**

- ✅ **Foundation**: 100% Complete
- ✅ **Core Infrastructure**: 100% Complete
- 🚧 **State Management**: 0% Complete
- 🚧 **UI Components**: 0% Complete
- 🚧 **Advanced Features**: 0% Complete

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Ensure Supabase credentials are correct
   - Run the database setup script
   - Check RLS policies

2. **File Upload Failures**
   - Verify storage bucket exists
   - Check file size and type
   - Ensure authentication is working

3. **Analysis Processing Errors**
   - Check Gemini AI API key
   - Verify file content is accessible
   - Review error logs for details

### Getting Help

- Check the console for detailed error messages
- Verify all environment variables are set
- Ensure database setup script was run successfully

## 📝 License

This project is proprietary software. All rights reserved.
