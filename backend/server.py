from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from passlib.context import CryptContext
import re
import shutil

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

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "actor-club-secret-key-2024"
ALGORITHM = "HS256"

# File upload settings
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    surname: str
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    workplace: Optional[str] = None
    job_title: Optional[str] = None
    hobbies: Optional[str] = None
    skills: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    profile_photo: Optional[str] = None
    projects: Optional[List[str]] = []
    board_member: Optional[str] = None
    is_admin: bool = False
    is_approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    surname: str
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    workplace: Optional[str] = None
    job_title: Optional[str] = None
    hobbies: Optional[str] = None
    skills: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    projects: Optional[List[str]] = []
    board_member: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Şifre en az 8 karakter olmalıdır')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Şifre en az bir harf içermelidir')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Şifre en az bir özel karakter içermelidir')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    address: Optional[str] = None
    workplace: Optional[str] = None
    job_title: Optional[str] = None
    hobbies: Optional[str] = None
    skills: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    projects: Optional[List[str]] = None
    is_approved: Optional[bool] = None

class Dues(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    month: str  # Eylül, Ekim, Kasım, Aralık, Ocak, Şubat, Mart, Nisan, Mayıs, Haziran
    year: int
    amount: int = 1000
    is_paid: bool = False
    payment_date: Optional[datetime] = None
    iban: str = "TR12 3456 7890 1234 5678 9012 34"

class Event(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    date: datetime
    location: Optional[str] = None
    photos: Optional[List[str]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    location: Optional[str] = None

class Leadership(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    position: str
    photo: Optional[str] = None
    order: int = 0

class AboutUs(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    photos: Optional[List[str]] = []
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token süresi dolmuş")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Geçersiz token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(credentials.credentials)
    user_email = payload.get("sub")
    if user_email is None:
        raise HTTPException(status_code=401, detail="Token geçersiz")
    
    user = await db.users.find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı bulunamadı")
    
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yetkisiz erişim")
    return current_user

# Initialize default data
async def initialize_default_data():
    # Create admin users
    admin_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin1@actorclub.com",
            "password": hash_password("ActorClub2024!"),
            "name": "Admin",
            "surname": "Bir",
            "phone": None,
            "birth_date": None,
            "address": None,
            "workplace": None,
            "job_title": None,
            "hobbies": None,
            "skills": None,
            "height": None,
            "weight": None,
            "profile_photo": None,
            "projects": [],
            "board_member": None,
            "is_admin": True,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc)
        },
        {
            "id": str(uuid.uuid4()),
            "email": "admin2@actorclub.com", 
            "password": hash_password("ClubActor2024@"),
            "name": "Admin",
            "surname": "İki",
            "phone": None,
            "birth_date": None,
            "address": None,
            "workplace": None,
            "job_title": None,
            "hobbies": None,
            "skills": None,
            "height": None,
            "weight": None,
            "profile_photo": None,
            "projects": [],
            "board_member": None,
            "is_admin": True,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    for admin_data in admin_users:
        existing_admin = await db.users.find_one({"email": admin_data["email"]})
        if not existing_admin:
            admin_user = User(**admin_data)
            await db.users.insert_one(admin_user.dict())
            print(f"Created admin user: {admin_data['email']}")
        else:
            # Update existing admin with password if missing
            if "password" not in existing_admin:
                await db.users.update_one(
                    {"email": admin_data["email"]},
                    {"$set": {"password": admin_data["password"]}}
                )
                print(f"Updated password for admin: {admin_data['email']}")
    
    # Create leadership structure
    leadership_data = [
        {"name": "Çağlar İşgören", "position": "Kurucu", "order": 1},
        {"name": "Göksel Kortay", "position": "Onursal Başkan", "order": 2},
        {"name": "Kökten Ulaş Birand", "position": "Onursal Başkan", "order": 3},
        {"name": "Cengiz Karakuzu", "position": "Onursal Başkan", "order": 4},
        {"name": "Emre Turgut", "position": "Yönetim Kurulu Başkanı", "order": 5},
        {"name": "Tuğba Çakı", "position": "Yönetim Kurulu Üyesi", "order": 6},
        {"name": "Duygu Asker Aksoy", "position": "Yönetim Kurulu Üyesi", "order": 7},
        {"name": "Seda Ateş", "position": "Yönetim Kurulu Üyesi", "order": 8},
        {"name": "Utkan Devrim Zeyrek", "position": "Yönetim Kurulu Üyesi", "order": 9}
    ]
    
    for leader_data in leadership_data:
        existing_leader = await db.leadership.find_one({"name": leader_data["name"]})
        if not existing_leader:
            leader = Leadership(**leader_data)
            await db.leadership.insert_one(leader.dict())

# Auth routes
@api_router.post("/auth/login")
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email veya şifre hatalı")
    
    if not user["is_approved"]:
        raise HTTPException(status_code=401, detail="Üyeliğiniz henüz onaylanmamış")
    
    token = create_access_token({"sub": user["email"]})
    return {"access_token": token, "token_type": "bearer", "user": User(**user)}

@api_router.post("/auth/change-password")
async def change_password(old_password: str, new_password: str, current_user: User = Depends(get_current_user)):
    user = await db.users.find_one({"email": current_user.email})
    if not verify_password(old_password, user["password"]):
        raise HTTPException(status_code=400, detail="Mevcut şifre hatalı")
    
    # Validate new password
    try:
        UserCreate(email="temp@temp.com", password=new_password, name="temp", surname="temp")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    await db.users.update_one(
        {"email": current_user.email},
        {"$set": {"password": hash_password(new_password)}}
    )
    return {"message": "Şifre başarıyla değiştirildi"}

# User routes
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate, current_user: User = Depends(get_admin_user)):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu email zaten kayıtlı")
    
    user_dict = user_data.dict()
    user_dict["password"] = hash_password(user_data.password)
    user = User(**user_dict)
    
    await db.users.insert_one(user.dict())
    
    # Create dues for the current year
    months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
    current_year = datetime.now().year
    for month in months:
        dues = Dues(user_id=user.id, month=month, year=current_year)
        await db.dues.insert_one(dues.dict())
    
    return user

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    users = await db.users.find({"is_approved": True}).to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/pending", response_model=List[User])
async def get_pending_users(current_user: User = Depends(get_admin_user)):
    users = await db.users.find({"is_approved": False}).to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return User(**user)

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserUpdate, current_user: User = Depends(get_current_user)):
    # Users can update their own profile, admins can update any profile
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yetkisiz erişim")
    
    update_data = {k: v for k, v in user_data.dict().items() if v is not None}
    
    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})
    
    user = await db.users.find_one({"id": user_id})
    return User(**user)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Also delete user's dues
    await db.dues.delete_many({"user_id": user_id})
    
    return {"message": "Kullanıcı silindi"}

@api_router.get("/users/search/{query}", response_model=List[User])
async def search_users(query: str, current_user: User = Depends(get_current_user)):
    users = await db.users.find({
        "is_approved": True,
        "$or": [
            {"name": {"$regex": query, "$options": "i"}},
            {"surname": {"$regex": query, "$options": "i"}},
            {"email": {"$regex": query, "$options": "i"}}
        ]
    }).to_list(100)
    return [User(**user) for user in users]

# Dues routes
@api_router.get("/dues/{user_id}", response_model=List[Dues])
async def get_user_dues(user_id: str, current_user: User = Depends(get_current_user)):
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Yetkisiz erişim")
    
    dues = await db.dues.find({"user_id": user_id}).to_list(1000)
    return [Dues(**due) for due in dues]

@api_router.put("/dues/{due_id}/pay")
async def mark_due_as_paid(due_id: str, current_user: User = Depends(get_admin_user)):
    await db.dues.update_one(
        {"id": due_id},
        {"$set": {"is_paid": True, "payment_date": datetime.now(timezone.utc)}}
    )
    return {"message": "Aidat ödendi olarak işaretlendi"}

@api_router.put("/dues/{due_id}/unpay")
async def mark_due_as_unpaid(due_id: str, current_user: User = Depends(get_admin_user)):
    await db.dues.update_one(
        {"id": due_id},
        {"$set": {"is_paid": False, "payment_date": None}}
    )
    return {"message": "Aidat ödenmedi olarak işaretlendi"}

# Events routes
@api_router.post("/events", response_model=Event)
async def create_event(event_data: EventCreate, current_user: User = Depends(get_admin_user)):
    event = Event(**event_data.dict())
    await db.events.insert_one(event.dict())
    return event

@api_router.get("/events", response_model=List[Event])
async def get_events():
    events = await db.events.find().sort("date", -1).to_list(1000)
    return [Event(**event) for event in events]

@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return Event(**event)

@api_router.delete("/events/{event_id}")
async def delete_event(event_id: str, current_user: User = Depends(get_admin_user)):
    result = await db.events.delete_one({"id": event_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    return {"message": "Etkinlik silindi"}

# Leadership routes
@api_router.get("/leadership", response_model=List[Leadership])
async def get_leadership():
    leadership = await db.leadership.find().sort("order", 1).to_list(1000)
    return [Leadership(**leader) for leader in leadership]

@api_router.put("/leadership/{leader_id}")
async def update_leadership(leader_id: str, photo_url: str, current_user: User = Depends(get_admin_user)):
    await db.leadership.update_one(
        {"id": leader_id},
        {"$set": {"photo": photo_url}}
    )
    return {"message": "Fotoğraf güncellendi"}

# About Us routes
@api_router.get("/about")
async def get_about():
    about = await db.about_us.find_one()
    if about:
        return AboutUs(**about)
    return {"content": "", "photos": []}

@api_router.put("/about")
async def update_about(content: str, photos: List[str] = [], current_user: User = Depends(get_admin_user)):
    about_data = {
        "content": content,
        "photos": photos,
        "last_updated": datetime.now(timezone.utc)
    }
    
    await db.about_us.delete_many({})  # Remove existing
    about = AboutUs(**about_data)
    await db.about_us.insert_one(about.dict())
    
    return about

# File upload routes
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_admin_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya seçilmedi")
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif"]:
        raise HTTPException(status_code=400, detail="Sadece resim dosyaları yüklenebilir")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"file_url": f"/uploads/{file_id}.{file_extension}"}

@api_router.get("/")
async def root():
    return {"message": "Actor Club Portal API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await initialize_default_data()

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()