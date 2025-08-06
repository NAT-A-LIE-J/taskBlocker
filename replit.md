# TimeBlock Pro - Persistent Time-Blocking Todo List App

## Overview

TimeBlock Pro is a progressive web application designed for personal productivity through time-blocking and dynamic task management. The application combines a persistent weekly calendar with a flexible todo list system, optimized for iPad use and deployable to platforms like GitHub Pages. The core concept centers around maintaining constant weekly time block structures while allowing tasks to flow dynamically between different activity types.

The application features a dual-view interface with a split-screen layout showing the calendar and todo list side-by-side, with the ability to expand either view to full-screen. It includes PWA capabilities for offline functionality and home screen installation, making it ideal for mobile productivity workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS custom properties for theming, supporting both light and dark modes
- **State Management**: React hooks with custom storage layer, no external state management library
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management with custom query client configuration

### Backend Architecture
- **Server**: Express.js with TypeScript, configured for both development and production environments
- **API Structure**: RESTful endpoints with /api prefix, currently minimal with placeholder routes
- **Middleware**: Custom logging middleware for request/response tracking
- **Development Tools**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Primary Storage**: Browser localStorage for immediate data persistence
- **Schema Management**: Drizzle ORM with PostgreSQL dialect for potential database integration
- **Backup Strategy**: Automatic JSON export to Downloads folder (weekly intervals)
- **Data Models**: Strongly typed schemas using Zod validation for BlockTypes, TimeBlocks, Tasks, and TimerSessions
- **Storage Interface**: Abstract storage layer with in-memory implementation for development

### Authentication and Authorization
Currently no authentication system implemented - designed as a personal productivity app with local data storage.

### PWA Implementation
- **Service Worker**: Custom implementation with cache-first strategy for offline functionality
- **Web App Manifest**: Configured for standalone display mode with shortcuts for quick actions
- **Offline Support**: Caches static assets and provides offline functionality
- **Home Screen Integration**: Optimized for "Add to Home Screen" experience on mobile devices

### Time Management System
- **Calendar Structure**: 7-day weekly view (Sunday to Saturday) with 30-minute time slots from 7 AM to 11 PM
- **Block Management**: Drag-and-drop interface for creating time blocks with overlap prevention
- **Task Integration**: Tasks can be associated with specific block types and include priority levels, deadlines, and completion tracking
- **Timer Functionality**: Built-in focus timer that integrates with active time blocks

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver for potential cloud database integration
- **drizzle-orm**: Type-safe SQL ORM for database operations
- **drizzle-kit**: Database migration and schema management tools

### UI and Interaction
- **@radix-ui/***: Comprehensive set of accessible UI primitives (dialogs, dropdowns, forms, etc.)
- **@tanstack/react-query**: Server state management and caching
- **date-fns**: Date manipulation and formatting utilities
- **embla-carousel-react**: Carousel component for potential UI enhancements
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library
- **nanoid**: Unique ID generation for client-side data

### PWA and Performance
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tools

### Form and Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolver integration
- **zod**: Schema validation and type inference

The application is architected to be deployment-flexible, with the ability to run entirely client-side for static hosting or with a backend server for enhanced functionality. The modular storage system allows for easy migration from localStorage to a full database solution when needed.