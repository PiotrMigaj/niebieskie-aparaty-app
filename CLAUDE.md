# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Starts Nuxt dev server on http://localhost:3000
- **Build**: `npm run build` - Builds the application for production
- **Preview**: `npm run preview` - Locally preview production build
- **Generate**: `npm run generate` - Generate static site
- **Prepare**: `npm run postinstall` or `nuxt prepare` - Prepare project (auto-runs after install)

## Architecture Overview

This is a Nuxt 3 full-stack photography gallery application called "Niebieskie Aparaty" (Blue Cameras). It's a photo event management system where photographers can upload event galleries and clients can view and select photos.

### Core Tech Stack
- **Frontend**: Nuxt 3 with Vue 3, TypeScript, Tailwind CSS
- **UI Library**: Nuxt UI (v3) with Heroicons
- **Backend**: Nuxt server API routes with H3
- **Database**: AWS DynamoDB
- **Storage**: AWS S3 for images
- **Email**: AWS SES for notifications
- **Authentication**: nuxt-auth-utils with session-based auth
- **Image Processing**: Sharp for optimization
- **Virtual Scrolling**: vue-virtual-scroller for performance with large galleries

### Key Features
- **Event Management**: Create events with photo galleries
- **Photo Selection**: Clients can browse and select photos from events
- **Image Gallery**: Masonry layout with virtual scrolling for performance
- **Authentication**: Basic username/password auth with bcrypt
- **File Management**: S3 integration with presigned URLs
- **Email Notifications**: Automated selection confirmations via SES

### Project Structure

#### Frontend (`app/`)
- `composables/`: Business logic composables (useAuth, useEventGallery, useEvents, useGallery, useSelection)
- `components/`: Vue components for UI elements
- `pages/`: File-based routing with nested routes for events and galleries
- `layouts/`: Layout templates (default, gallery, login)
- `middleware/`: Route guards (authenticated.ts)
- `plugins/`: Client-side plugins for third-party libraries

#### Backend (`server/`)
- `api/`: API endpoints following RESTful patterns
- `config/`: AWS service configurations (DynamoDB, S3, SES)
- `repository/`: Data access layer with repository pattern
- `service/`: Business logic services (authService)
- `utils/`: Utility functions for email and file operations

#### Shared (`shared/`)
- `types/`: TypeScript interfaces shared between client and server
- `utils/`: Shared utility functions

### Database Schema (DynamoDB)
- **Users**: Authentication with username (PK), password (bcrypt), active status
- **Events**: Event metadata with eventId (PK), username, date, title, description
- **Galleries**: Photo gallery data linked to events
- **Selections**: Client photo selections with selectionId (PK)

### Authentication Flow
1. Client submits credentials via basic auth (username:password base64 encoded)
2. Server validates against DynamoDB Users table with bcrypt
3. Session created with 7-day expiration using nuxt-auth-utils
4. Middleware protects routes requiring authentication

### File Management
- Original images stored in S3
- Compressed/thumbnail versions generated
- Presigned URLs for secure access
- Download functionality via presigned URLs

### Performance Optimizations
- Virtual scrolling for large image galleries (2000+ images)
- Image lazy loading with placeholder animations
- Chunked data loading (2000 images per chunk)
- Masonry layout with responsive columns

### Environment Variables Required
- `AWS_REGION`: AWS region for services
- `AWS_ACCESS_KEY_ID`: AWS access key
- `AWS_SECRET_ACCESS_KEY`: AWS secret key

### Key Patterns
- Repository pattern for data access
- Singleton pattern for services (AuthService, repositories)
- Composables for reactive state management
- Type-safe API endpoints with shared TypeScript interfaces
- Error handling with toast notifications