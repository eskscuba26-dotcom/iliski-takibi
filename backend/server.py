from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class Photo(BaseModel):
    id: Optional[str] = None
    image_base64: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class PhotoResponse(BaseModel):
    id: str
    image_base64: str
    uploaded_at: datetime

class PhotoUpload(BaseModel):
    image_base64: str

class RelationshipStart(BaseModel):
    start_date: str  # ISO format string

class RelationshipData(BaseModel):
    start_date: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Routes
@api_router.get("/")
async def root():
    return {"message": "Relationship Tracker API"}


# Photo endpoints
@api_router.post("/photos", response_model=PhotoResponse)
async def upload_photo(photo_data: PhotoUpload):
    """Upload a new photo"""
    photo = Photo(
        image_base64=photo_data.image_base64,
        uploaded_at=datetime.utcnow()
    )
    
    result = await db.photos.insert_one(photo.dict(exclude={"id"}))
    
    return PhotoResponse(
        id=str(result.inserted_id),
        image_base64=photo.image_base64,
        uploaded_at=photo.uploaded_at
    )


@api_router.get("/photos", response_model=List[PhotoResponse])
async def get_photos():
    """Get all photos"""
    photos = await db.photos.find().sort("uploaded_at", -1).to_list(1000)
    
    return [
        PhotoResponse(
            id=str(photo["_id"]),
            image_base64=photo["image_base64"],
            uploaded_at=photo["uploaded_at"]
        )
        for photo in photos
    ]


@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str):
    """Delete a photo"""
    try:
        result = await db.photos.delete_one({"_id": ObjectId(photo_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Photo not found")
        return {"message": "Photo deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Start date endpoints
@api_router.get("/start-date")
async def get_start_date():
    """Get the relationship start date"""
    data = await db.relationship.find_one()
    
    if not data:
        # Default start date: 25 Ocak 2025 20:30 (Turkey timezone)
        default_date = "2025-01-25T20:30:00+03:00"
        default_image = "https://customer-assets.emergentagent.com/job_e4db3706-e757-48e7-9549-6099030dfeac/artifacts/j9t0hd5t_20250920_205107.jpg"
        await db.relationship.insert_one({
            "start_date": default_date,
            "main_photo": default_image,
            "created_at": datetime.utcnow()
        })
        return {"start_date": default_date, "main_photo": default_image}
    
    return {
        "start_date": data.get("start_date"),
        "main_photo": data.get("main_photo", "")
    }


@api_router.post("/start-date")
async def set_start_date(date_data: RelationshipStart):
    """Set or update the relationship start date"""
    await db.relationship.delete_many({})  # Remove old data
    
    result = await db.relationship.insert_one({
        "start_date": date_data.start_date,
        "created_at": datetime.utcnow()
    })
    
    return {"start_date": date_data.start_date}


@api_router.post("/main-photo")
async def update_main_photo(photo_data: PhotoUpload):
    """Update the main couple photo"""
    data = await db.relationship.find_one()
    
    if data:
        await db.relationship.update_one(
            {"_id": data["_id"]},
            {"$set": {"main_photo": photo_data.image_base64}}
        )
    else:
        # Create new entry with default date
        await db.relationship.insert_one({
            "start_date": "2025-01-25T20:30:00+03:00",
            "main_photo": photo_data.image_base64,
            "created_at": datetime.utcnow()
        })
    
    return {"message": "Main photo updated successfully"}


@api_router.get("/main-photo")
async def get_main_photo():
    """Get the main couple photo"""
    data = await db.relationship.find_one()
    
    if not data or "main_photo" not in data:
        # Return default photo
        default_image = "https://customer-assets.emergentagent.com/job_e4db3706-e757-48e7-9549-6099030dfeac/artifacts/j9t0hd5t_20250920_205107.jpg"
        return {"main_photo": default_image}
    
    return {"main_photo": data["main_photo"]}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
