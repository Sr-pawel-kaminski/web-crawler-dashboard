# Web Crawler Dashboard

## Features

- **URL Management**: Add, edit, and delete URLs
- **Real-time Analysis**: Start/stop analysis with live status updates
- **Detailed Reports**: View comprehensive analysis results including:
  - HTML version detection
  - Page title extraction
  - Heading structure analysis
  - Internal and external link counting
  - Broken link detection
  - Login form detection
- **Interactive Dashboard**
- **Visual Charts**
- **Responsive Design**

## Tech Stack

### Backend
- **Go**
- **Gin** 
- **GORM**
- **SQLite**
- **goquery**

### Frontend
- **React**
- **TypeScript** 
- **Material-UI**
- **Vite**
- **Recharts**
- **Axios**

## Prerequisites

Before running this application, make sure you have the following installed:

- **Go**
- **Node.js**
- **npm**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone web-crawler-dashboard
cd web-crawler-dashboard
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
go mod download
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

## Running the Application

### Option 1: Development Mode (Recommended)

#### Start the Backend Server

```bash
cd backend
go run .
```

The backend server will start on `http://localhost:8080`

#### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Open your browser** and navigate to `http://localhost:5173`

2. **Add URLs** for analysis:
   - Click the **+ button** at the bottom-left of the table
   - Input a valid URL (e.g., `https://example.com`)
   - Click "Add URL"

3. **Start Analysis**:
   - Click the **"Start"** button next to any URL
   - The status will change to "running"
   - Analysis results will appear automatically

4. **View Details**:
   - Click on any row in the table to view detailed analysis
   - See charts, link breakdowns, and comprehensive reports

5. **Manage URLs**:
   - Use **"Edit"** button to change URL addresses
   - Use **"Delete"** button to remove URLs
   - Use **"Stop"** button to halt running analysis

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/urls` - List all URLs
- `POST /api/urls` - Add a new URL
- `PUT /api/urls/:id` - Update a URL
- `DELETE /api/urls/:id` - Delete a URL
- `GET /api/urls/:id` - Get URL details
- `POST /api/urls/:id/start` - Start analysis
- `POST /api/urls/:id/stop` - Stop analysis
- `POST /api/urls/:id/analyze` - Analyze URL
