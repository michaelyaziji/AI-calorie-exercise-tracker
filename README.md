# Calorie and Exercise Tracker

A full-stack web application for tracking calories and exercises, with AI-powered meal analysis.

## Features

- User authentication and registration
- Exercise logging with different types and intensities
- Meal logging with AI-powered nutritional analysis
- Progress tracking
- Mobile-friendly interface

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL (with Neon)
- AI: OpenAI API for meal analysis

## Deployment Instructions

1. Create an account on [Render.com](https://render.com)
2. Create a new PostgreSQL database on [Neon](https://neon.tech)
3. Fork or clone this repository
4. On Render.com:
   - Create a new Web Service
   - Connect your GitHub repository
   - Use the following settings:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Add the following environment variables:
     - `DATABASE_URL`: Your Neon PostgreSQL connection string
     - `OPENAI_API_KEY`: Your OpenAI API key
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `SESSION_SECRET`: Will be auto-generated

The application will be automatically deployed and available at your Render URL.

## Development

To run the application locally:

1. Clone the repository
2. Create a `.env` file with the required environment variables
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for meal analysis
- `SESSION_SECRET`: Secret for session management
- `PORT`: Port number (defaults to 4000 in development)
- `NODE_ENV`: `development` or `production` 