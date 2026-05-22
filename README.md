# Weather Forecast App

React + Leaflet frontend, FastAPI backend, OpenWeather API.

## Setup

### 1. Backend

```bash
cd weather-app/backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt

# Create .env from example
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

Edit `.env` and add your OpenWeather API key:
```
OPENWEATHER_API_KEY=your_actual_key_here
ALLOWED_ORIGINS=http://localhost:5173
```

Start the backend:
```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd weather-app/frontend
npm install

# Create .env from example
copy .env.example .env       # Windows
# cp .env.example .env       # Mac/Linux
```

`.env` content (default works for local dev):
```
VITE_API_URL=http://localhost:8000/api
```

Start the frontend:
```bash
npm run dev
```

Open: http://localhost:5173

---

## Get an OpenWeather API Key

1. Sign up at https://openweathermap.org/api
2. Go to API Keys in your account
3. Copy the key into `backend/.env`

Free tier supports all endpoints used here.
