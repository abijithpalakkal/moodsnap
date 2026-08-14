import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.auth import router as auth_router
from routes.moods import router as moods_router
from routes.stats import router as stats_router

load_dotenv()

app = FastAPI(
    title="MoodSnap API",
    description="Role-Based Mood Tracking REST API powered by FastAPI & Supabase",
    version="1.0.0"
)

# Enable CORS for Next.js frontend client
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(moods_router)
app.include_router(stats_router)

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "app": "MoodSnap API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
