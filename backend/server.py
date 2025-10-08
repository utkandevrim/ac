from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, File, UploadFile
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
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
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'actor-club-secret-key-2024')
ALGORITHM = "HS256"

# File upload settings
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str  # New: username field (isim.soyisim format)
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

class UserWithPassword(User):
    password: str

class UserCreate(BaseModel):
    username: str  # New: username field
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
    
    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-z]+\.[a-z]+$', v):
            raise ValueError('Kullanıcı adı isim.soyisim formatında olmalıdır (küçük harf)')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8 or len(v) > 16:
            raise ValueError('Şifre 8-16 karakter arasında olmalıdır')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Şifre en az bir harf içermelidir')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('Şifre en az bir özel karakter içermelidir')
        return v

class UserLogin(BaseModel):
    username: str  # Changed from email to username
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    surname: Optional[str] = None
    email: Optional[str] = None
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
    projects: Optional[List[str]] = None
    is_approved: Optional[bool] = None

class Dues(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    month: str  # Eylül, Ekim, Kasım, Aralık, Ocak, Şubat, Mart, Nisan, Mayıs, Haziran
    year: int
    amount: int = 1000
    is_paid: bool = False
    payment_date: Optional[datetime] = None
    iban: str = "TR12 3456 7890 1234 5678 9012 34"
    
    class Config:
        populate_by_name = True
        allow_population_by_field_name = True

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
    mission: Optional[str] = None
    vision: Optional[str] = None
    photos: Optional[List[str]] = []
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class HomepageContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hero_title: str = "Actor Club Portal'a Hoş Geldiniz"
    hero_subtitle: str = "Profesyonel oyunculuk dünyasında yeteneklerinizi geliştirin, deneyimli mentorlardan öğrenin ve sanat camiasının bir parçası olun."
    hero_quote: str = "\"Actor Club, oyunculuk tutkusunu profesyonel becerilerle buluşturan bir platform olarak kurulmuştur. Amacımız, yetenekli bireyleri sanat dünyasında desteklemektir.\""
    honorary_section_title: str = "Onursal Başkanlarımız"
    honorary_section_subtitle: str = "Deneyimleri ve vizyonlarıyla kulübümüze yön veren değerli isimler"
    management_section_title: str = "Yönetim Kurulumuz"
    management_section_subtitle: str = "Actor Club'ın geleceğini şekillendiren deneyimli yöneticilerimiz"
    last_updated: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Campaign(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    company_name: str
    discount_details: str
    terms_conditions: str
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class QRToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    token: str
    user_id: str
    campaign_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: datetime
    is_used: bool = False
    used_at: Optional[datetime] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return token

def generate_qr_token():
    """Generate a unique QR token"""
    import secrets
    return secrets.token_urlsafe(32)

async def check_member_dues_eligibility(user_id: str) -> bool:
    """Check if member has paid all dues except current month"""
    try:
        # Get user's dues
        dues = await db.dues.find({"user_id": user_id}).to_list(length=None)
        
        # Get current month/year
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year
        
        # Check if all previous months are paid
        for due in dues:
            due_month = due.get('month')
            due_year = due.get('year')
            is_paid = due.get('is_paid', False)
            
            # Skip current month
            if due_year == current_year and due_month == current_month:
                continue
                
            # If any previous month is unpaid, not eligible
            if not is_paid:
                return False
                
        return True
    except Exception as e:
        print(f"Error checking dues eligibility: {e}")
        return False

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
            "username": "admin.yonetici",
            "email": "admin1@actorclub.com",
            "password": hash_password("ActorClub2024!"),
            "name": "Admin",
            "surname": "Yönetici",
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
            "username": "muzaffer.isgoren",
            "email": "muzaffer@actorclub.com", 
            "password": hash_password("Founder123!"),
            "name": "Muzaffer",
            "surname": "İşgören",
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
            "username": "super.admin",
            "email": "super.admin@actorclub.com",
            "password": hash_password("AdminActor2024!"),
            "name": "Super",
            "surname": "Admin",
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
        existing_admin = await db.users.find_one({"username": admin_data["username"]})
        if not existing_admin:
            admin_user = User(**admin_data)
            await db.users.insert_one(admin_user.dict())
            print(f"Created admin user: {admin_data['username']}")
        else:
            # Update existing admin with password if missing
            if "password" not in existing_admin or "username" not in existing_admin:
                await db.users.update_one(
                    {"email": admin_data["email"]},
                    {"$set": {
                        "password": admin_data["password"],
                        "username": admin_data["username"]
                    }}
                )
                print(f"Updated admin: {admin_data['username']}")
    
    # Create all new members
    members_data = [
        # TUĞBA ÇAKI Takımı
        {"name": "İkbal", "surname": "Karatepe", "team": "Diyojen"},
        {"name": "Deniz", "surname": "Duygulu", "team": "Diyojen"},
        {"name": "Nazlı Sena", "surname": "Eser", "team": "Diyojen"},
        {"name": "Ergun", "surname": "Acar", "team": "Diyojen"},
        {"name": "Hatice Dilan", "surname": "Genç", "team": "Diyojen"},
        {"name": "Banu", "surname": "Gümüşkaynak", "team": "Diyojen"},
        {"name": "Ebru", "surname": "Ateşdağlı", "team": "Diyojen"},
        {"name": "Hasan Ali", "surname": "Erk", "team": "Diyojen"},
        {"name": "Mustafa Deniz", "surname": "Özer", "team": "Diyojen"},
        {"name": "Hüseyin Ertan", "surname": "Sezgin", "team": "Diyojen"},
        {"name": "Afet", "surname": "Bakay", "team": "Diyojen"},
        {"name": "Cengiz", "surname": "Karakuzu", "team": "Diyojen"},
        {"name": "Nadir", "surname": "Şimşek", "team": "Diyojen"},
        {"name": "Melih", "surname": "Ülgentay", "team": "Diyojen"},
        {"name": "Elif", "surname": "Alıveren", "team": "Diyojen"},
        {"name": "Buğra Han", "surname": "Acar", "team": "Diyojen"},
        {"name": "Bekir Berk", "surname": "Altınay", "team": "Diyojen"},
        {"name": "Ceyda", "surname": "Çınar", "team": "Diyojen"},
        {"name": "Ahmet", "surname": "İşleyen", "team": "Diyojen"},
        {"name": "Abdullah", "surname": "Baş", "team": "Diyojen"},
        {"name": "Alev", "surname": "Atam", "team": "Diyojen"},
        {"name": "İzem", "surname": "Karslı", "team": "Diyojen"},
        {"name": "Özkan", "surname": "Çiğdem", "team": "Diyojen"},
        {"name": "Berkant", "surname": "Oman", "team": "Diyojen"},
        {"name": "Beren", "surname": "Karamustafaoğlu", "team": "Diyojen"},
        {"name": "Demet", "surname": "Aslan", "team": "Diyojen"},
        {"name": "Ece", "surname": "Kılıç", "team": "Diyojen"},
        {"name": "Hazal", "surname": "Aktaş", "team": "Diyojen"},
        
        # DUYGU ASKER AKSOY Takımı  
        {"name": "Sultan", "surname": "Güleryüz", "team": "Hypatia"},
        {"name": "Dilek", "surname": "Şahin Taş", "team": "Hypatia"},
        {"name": "Merve", "surname": "Dür", "team": "Hypatia"},
        {"name": "Sinan", "surname": "Telli", "team": "Hypatia"},
        {"name": "Ebru", "surname": "Polat", "team": "Hypatia"},
        {"name": "Fatma Neva", "surname": "Şen", "team": "Hypatia"},
        {"name": "Meltem", "surname": "Sözüer", "team": "Hypatia"},
        {"name": "Fethiye", "surname": "Turgut", "team": "Hypatia"},
        {"name": "Şahin", "surname": "Kul", "team": "Hypatia"},
        {"name": "Ertuğrul", "surname": "Ceyhan", "team": "Hypatia"},
        {"name": "İbrahim", "surname": "Şanlı", "team": "Hypatia"},
        {"name": "İpek", "surname": "Apaydın", "team": "Hypatia"},
        {"name": "Aslı", "surname": "Cindaruk", "team": "Hypatia"},
        {"name": "Yadigar", "surname": "Külice", "team": "Hypatia"},
        {"name": "Volkan", "surname": "Arslan", "team": "Hypatia"},
        {"name": "Mahir", "surname": "Taşpulat", "team": "Hypatia"},
        {"name": "Gözde", "surname": "Karadağ", "team": "Hypatia"},
        {"name": "Rumeysa Nur", "surname": "Öztürk", "team": "Hypatia"},
        {"name": "Nafiz", "surname": "Selvi", "team": "Hypatia"},
        {"name": "Elif", "surname": "Kesikçiler", "team": "Hypatia"},
        {"name": "Özge", "surname": "Türkoğlu", "team": "Hypatia"},
        {"name": "Damla", "surname": "Ongün", "team": "Hypatia"},
        {"name": "Simay", "surname": "Cihan", "team": "Hypatia"},
        {"name": "Ece", "surname": "Arısoy", "team": "Hypatia"},
        {"name": "Şevval", "surname": "Karaboğa", "team": "Hypatia"},
        {"name": "Mehmet Emrah", "surname": "Güven", "team": "Hypatia"},
        {"name": "Hatice", "surname": "Avcı", "team": "Hypatia"},
        {"name": "Metin Celil", "surname": "Kuşsever", "team": "Hypatia"},
        
        # SEDA ATEŞ Takımı
        {"name": "Gürhan", "surname": "Aksu", "team": "Artemis"},
        {"name": "Hulusi", "surname": "Karabil", "team": "Artemis"},
        {"name": "Kökten Ulaş", "surname": "Birant", "team": "Artemis"},
        {"name": "Elif", "surname": "Gazel", "team": "Artemis"},
        {"name": "Tayyibe Alpay", "surname": "Uyanıker", "team": "Artemis"},
        {"name": "Eren", "surname": "Özgül", "team": "Artemis"},
        {"name": "Gaye", "surname": "Eren", "team": "Artemis"},
        {"name": "Şafak", "surname": "Sipahi", "team": "Artemis"},
        {"name": "Anıl", "surname": "Özçelik", "team": "Artemis"},
        {"name": "Çağla Beril", "surname": "Karayel", "team": "Artemis"},
        {"name": "Oğuz Serdar", "surname": "Zal", "team": "Artemis"},
        {"name": "Sabri Hakan", "surname": "Dokurlar", "team": "Artemis"},
        {"name": "Ahmet Rasim", "surname": "Burhanoğlu", "team": "Artemis"},
        {"name": "İrem", "surname": "Baysoy", "team": "Artemis"},
        {"name": "Abdülmetin", "surname": "Ürünveren", "team": "Artemis"},
        {"name": "Pelin", "surname": "Baki", "team": "Artemis"},
        {"name": "Esra", "surname": "Tür", "team": "Artemis"},
        {"name": "Leman", "surname": "Atiker", "team": "Artemis"},
        {"name": "Rabia Demir", "surname": "Köse", "team": "Artemis"},
        {"name": "Naci", "surname": "Çobanoğlu", "team": "Artemis"},
        {"name": "Özlem", "surname": "Demir", "team": "Artemis"},
        {"name": "Rahime Gözde", "surname": "Narin", "team": "Artemis"},
        
        # UTKAN DEVRİM ZEYREK Takımı
        {"name": "Saray", "surname": "Kaya", "team": "Hermes"},
        {"name": "Ulaş", "surname": "Kesikçiler", "team": "Hermes"},
        {"name": "Elif", "surname": "Tortop Doğan", "team": "Hermes"},
        {"name": "Zeynep", "surname": "Ermeç", "team": "Hermes"},
        {"name": "Gül", "surname": "Nacaroğlu", "team": "Hermes"},
        {"name": "İrem", "surname": "Ayas", "team": "Hermes"},
        {"name": "Kemal", "surname": "Erkilmen", "team": "Hermes"},
        {"name": "Senem", "surname": "Ünal", "team": "Hermes"},
        {"name": "Serkan", "surname": "Salgın", "team": "Hermes"},
        {"name": "Didem", "surname": "Karabil", "team": "Hermes"},
        {"name": "Ayşe", "surname": "Tumba", "team": "Hermes"},
        {"name": "Nur Ayça", "surname": "Öztürk", "team": "Hermes"},
        {"name": "Tamer", "surname": "Güleryüz", "team": "Hermes"},
        {"name": "Bülent", "surname": "Erdağı", "team": "Hermes"},
        {"name": "Ümit", "surname": "Peşeli", "team": "Hermes"},
        {"name": "Aybike Asena", "surname": "Karakaya", "team": "Hermes"},
        {"name": "Deniz", "surname": "Genç", "team": "Hermes"},
        {"name": "Azad Burak", "surname": "Süne", "team": "Hermes"},
        {"name": "Erdem", "surname": "Kocabay", "team": "Hermes"},
        {"name": "Rıdvan", "surname": "Baş", "team": "Hermes"},
        {"name": "Fulya", "surname": "Ersayan", "team": "Hermes"},
        {"name": "Rasim Can", "surname": "Birol", "team": "Hermes"},
        {"name": "Dilan", "surname": "Kart", "team": "Hermes"},
        {"name": "Sıla", "surname": "Timur", "team": "Hermes"},
        {"name": "Amir", "surname": "Karabuğday", "team": "Hermes"},
        {"name": "Sude", "surname": "Kahraman", "team": "Hermes"},
        {"name": "Samet", "surname": "Salık", "team": "Hermes"},
        {"name": "Erem", "surname": "Kılıç", "team": "Hermes"},
        {"name": "Seda", "surname": "Baykut", "team": "Hermes"},
        
        # Test kullanıcısı
        {"name": "Test", "surname": "Kullanıcı", "team": None}
    ]
    
    # Create password for each member
    import random
    import string
    
    def generate_password():
        # Generate 8-16 char password with at least 1 letter and 1 special char
        length = random.randint(8, 16)
        letters = string.ascii_letters
        special_chars = "!@#$%^&*"
        
        # Ensure at least 1 letter and 1 special char
        password = random.choice(letters) + random.choice(special_chars)
        
        # Fill the rest
        remaining_chars = letters + string.digits + special_chars
        for _ in range(length - 2):
            password += random.choice(remaining_chars)
        
        # Shuffle the password
        password_list = list(password)
        random.shuffle(password_list)
        return ''.join(password_list)
    
    for member_data in members_data:
        # Create username in lowercase format
        name_clean = member_data["name"].lower().replace(" ", "")
        surname_clean = member_data["surname"].lower().replace(" ", "")
        username = f"{name_clean}.{surname_clean}"
        
        # Skip if username already exists
        existing_member = await db.users.find_one({"username": username})
        if existing_member:
            continue
            
        user_dict = {
            "id": str(uuid.uuid4()),
            "username": username,
            "email": f"{username}@actorclub.com",
            "password": hash_password(generate_password()),
            "name": member_data["name"],
            "surname": member_data["surname"],
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
            "board_member": member_data.get("team"),
            "is_admin": False,
            "is_approved": True,
            "created_at": datetime.now(timezone.utc)
        }
        
        user = User(**user_dict)
        await db.users.insert_one(user.dict())
        
        # Create dues for the current year
        months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
        current_year = datetime.now().year
        for month in months:
            dues = Dues(user_id=user.id, month=month, year=current_year)
            await db.dues.insert_one(dues.dict())
        
        print(f"Created member: {username}")
    
    # Create leadership structure
    leadership_data = [
        {"name": "Muzaffer Çağlar İşgören", "position": "Kurucu / Onursal Başkan", "order": 1},
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
    user = await db.users.find_one({"username": user_data.username})
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")
    
    # Check if user has password field
    if "password" not in user:
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")
    
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")
    
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
        UserCreate(username="temp.temp", email="temp@temp.com", password=new_password, name="temp", surname="temp")
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
    
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten kayıtlı")
    
    user_dict = user_data.dict()
    user_dict["password"] = hash_password(user_data.password)
    user_with_password = UserWithPassword(**user_dict)
    
    await db.users.insert_one(user_with_password.dict())
    
    # Create dues for the current year
    months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
    current_year = datetime.now().year
    for month in months:
        dues = Dues(user_id=user_with_password.id, month=month, year=current_year)
        await db.dues.insert_one(dues.dict())
    
    return User(**user_dict)

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    users = await db.users.find({"is_approved": True}).to_list(1000)
    
    # Filter out users without required fields and fix them
    valid_users = []
    for user in users:
        # Skip users without username field
        if 'username' not in user or user['username'] is None:
            # Create username for user
            name_clean = user['name'].lower().replace(' ', '')
            surname_clean = user['surname'].lower().replace(' ', '')
            # Convert Turkish characters
            turkish_map = {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'}
            for turkish, ascii_char in turkish_map.items():
                name_clean = name_clean.replace(turkish, ascii_char)
                surname_clean = surname_clean.replace(turkish, ascii_char)
            
            username = f"{name_clean}.{surname_clean}"
            
            # Update user in database
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"username": username}}
            )
            user['username'] = username
        
        try:
            valid_users.append(User(**user))
        except Exception:
            # Skip invalid users
            continue
    
    return valid_users

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
    print(f"DEBUG GET: Raw MongoDB dues: {dues[:1]}")  # Log first due
    
    pydantic_dues = [Dues(**due) for due in dues]
    print(f"DEBUG GET: Pydantic dues: {pydantic_dues[0].dict() if pydantic_dues else 'No dues'}")
    
    return pydantic_dues

@api_router.put("/dues/{due_id}/pay")
async def mark_due_as_paid(due_id: str, current_user: User = Depends(get_admin_user)):
    from bson import ObjectId
    
    try:
        # Convert string due_id to ObjectId and update using _id
        object_id = ObjectId(due_id)
        result = await db.dues.update_one(
            {"_id": object_id},
            {"$set": {"is_paid": True, "payment_date": datetime.now(timezone.utc)}}
        )
        print(f"DEBUG: Dues payment update result - matched: {result.matched_count}, modified: {result.modified_count}")
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Aidat bulunamadı")
            
    except Exception as e:
        print(f"DEBUG: Error in dues payment: {e}")
        raise HTTPException(status_code=400, detail="Geçersiz aidat ID")
    
    return {"message": "Aidat ödendi olarak işaretlendi"}

@api_router.put("/dues/{due_id}/unpay")
async def mark_due_as_unpaid(due_id: str, current_user: User = Depends(get_admin_user)):
    from bson import ObjectId
    
    try:
        # Convert string due_id to ObjectId and update using _id
        object_id = ObjectId(due_id)
        result = await db.dues.update_one(
            {"_id": object_id},
            {"$set": {"is_paid": False, "payment_date": None}}
        )
        print(f"DEBUG: Dues unpay update result - matched: {result.matched_count}, modified: {result.modified_count}")
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Aidat bulunamadı")
            
    except Exception as e:
        print(f"DEBUG: Error in dues unpay: {e}")
        raise HTTPException(status_code=400, detail="Geçersiz aidat ID")
        
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

@api_router.put("/events/{event_id}")
async def update_event(event_id: str, event_data: EventCreate, current_user: User = Depends(get_admin_user)):
    result = await db.events.update_one(
        {"id": event_id},
        {"$set": event_data.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    
    # Return updated event
    event = await db.events.find_one({"id": event_id})
    return Event(**event)

@api_router.post("/events/{event_id}/upload-photo")
async def upload_event_photo(event_id: str, file: UploadFile = File(...), current_user: User = Depends(get_admin_user)):
    # Check if event exists
    event = await db.events.find_one({"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Etkinlik bulunamadı")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Sadece resim dosyaları yükleyebilirsiniz")
    
    # Save file
    file_extension = file.filename.split('.')[-1].lower()
    filename = f"event_{event_id}_{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{filename}"
    
    os.makedirs("uploads", exist_ok=True)
    
    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update event with new photo
    photo_url = f"/api/uploads/{filename}"
    
    # Add to photos array
    await db.events.update_one(
        {"id": event_id},
        {"$push": {"photos": photo_url}}
    )
    
    return {"message": "Etkinlik fotoğrafı başarıyla yüklendi", "photo_url": photo_url}

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

# Homepage Content routes
@api_router.get("/homepage-content")
async def get_homepage_content():
    content = await db.homepage_content.find_one()
    if content:
        content.pop('_id', None)
        return content
    # Return default values if no content exists
    default_content = HomepageContent()
    return default_content.dict()

@api_router.put("/homepage-content")
async def update_homepage_content(content_data: dict, current_user: User = Depends(get_admin_user)):
    # Ensure we have default values for required fields
    if not content_data.get("id"):
        content_data["id"] = str(uuid.uuid4())
    
    content_data["last_updated"] = datetime.now(timezone.utc)
    
    # Update or create homepage content
    existing = await db.homepage_content.find_one()
    if existing:
        await db.homepage_content.update_one(
            {"id": existing.get("id", content_data["id"])},
            {"$set": content_data}
        )
    else:
        await db.homepage_content.insert_one(content_data)
    
    return {"message": "Homepage content updated successfully"}

# About Us routes
@api_router.get("/about")
async def get_about():
    about = await db.about_us.find_one()
    if about:
        # Remove MongoDB _id field for JSON serialization
        about.pop('_id', None)
        return about
    return {
        "content": "", 
        "mission": "", 
        "vision": "", 
        "photos": [],
        "contact": {
            "email": "",
            "phone": "",
            "address": "",
            "website": ""
        },
        "mainPhoto": None
    }

@api_router.put("/about")
async def update_about(about_data: dict, current_user: User = Depends(get_admin_user)):
    # Structure the data properly
    structured_data = {
        "content": about_data.get("content", ""),
        "mission": about_data.get("mission", ""),
        "vision": about_data.get("vision", ""),
        "contact": about_data.get("contact", {}),
        "mainPhoto": about_data.get("mainPhoto"),
        "photos": about_data.get("photos", []),
        "last_updated": datetime.now(timezone.utc)
    }
    
    await db.about_us.delete_many({})  # Remove existing
    await db.about_us.insert_one(structured_data)
    
    return {"message": "About bilgileri güncellendi"}

# Campaign routes
@api_router.get("/campaigns")
async def get_campaigns():
    """Get all active campaigns"""
    campaigns = await db.campaigns.find({"is_active": True}).to_list(length=None)
    for campaign in campaigns:
        campaign.pop('_id', None)
    return campaigns

@api_router.post("/campaigns")
async def create_campaign(campaign_data: dict, current_user: User = Depends(get_admin_user)):
    """Create a new campaign (admin only)"""
    campaign_data["id"] = str(uuid.uuid4())
    campaign_data["created_at"] = datetime.now(timezone.utc)
    campaign_data["is_active"] = True  # Set is_active to True for new campaigns
    await db.campaigns.insert_one(campaign_data)
    return {"message": "Campaign created successfully", "campaign_id": campaign_data["id"]}

@api_router.put("/campaigns/{campaign_id}")
async def update_campaign(campaign_id: str, campaign_data: dict, current_user: User = Depends(get_admin_user)):
    """Update campaign (admin only)"""
    campaign_data["last_updated"] = datetime.now(timezone.utc)
    result = await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": campaign_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign updated successfully"}

@api_router.delete("/campaigns/{campaign_id}")
async def delete_campaign(campaign_id: str, current_user: User = Depends(get_admin_user)):
    """Delete campaign (admin only)"""
    result = await db.campaigns.update_one(
        {"id": campaign_id},
        {"$set": {"is_active": False}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return {"message": "Campaign deleted successfully"}

@api_router.post("/campaigns/{campaign_id}/generate-qr")
async def generate_campaign_qr(campaign_id: str, current_user: User = Depends(get_current_user)):
    """Generate QR code for campaign if user is eligible"""
    # Check if campaign exists
    campaign = await db.campaigns.find_one({"id": campaign_id, "is_active": True})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Check if user has paid dues eligibility
    is_eligible = await check_member_dues_eligibility(current_user.id)
    if not is_eligible:
        raise HTTPException(status_code=403, detail="Aidat ödemeleriniz eksik. Kampanyaya katılamıyorsunuz.")
    
    # Generate QR token
    qr_token = generate_qr_token()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    # Save QR token to database
    qr_data = {
        "id": str(uuid.uuid4()),
        "token": qr_token,
        "user_id": current_user.id,
        "campaign_id": campaign_id,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "is_used": False
    }
    await db.qr_tokens.insert_one(qr_data)
    
    return {
        "qr_token": qr_token,
        "expires_at": expires_at.isoformat(),
        "campaign_title": campaign.get("title")
    }

@api_router.get("/verify-qr/{qr_token}")
async def verify_qr_code(qr_token: str):
    """Verify QR code and return member eligibility (public endpoint for campaign partners)"""
    # Find QR token
    qr_data = await db.qr_tokens.find_one({"token": qr_token})
    
    if not qr_data:
        return {
            "valid": False,
            "message": "Kampanya Geçersiz",
            "reason": "QR kod bulunamadı"
        }
    
    # Check if token has expired
    current_time = datetime.now(timezone.utc)
    expires_at = qr_data.get("expires_at")
    
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
    elif isinstance(expires_at, datetime) and expires_at.tzinfo is None:
        # If datetime is naive, assume it's UTC
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if current_time > expires_at:
        return {
            "valid": False,
            "message": "Kampanya Geçersiz",
            "reason": "QR kod süresi dolmuş"
        }
    
    # Check if already used
    if qr_data.get("is_used"):
        return {
            "valid": False,
            "message": "Kampanya Geçersiz",
            "reason": "QR kod daha önce kullanılmış"
        }
    
    # Get user details
    user = await db.users.find_one({"id": qr_data.get("user_id")})
    if not user:
        return {
            "valid": False,
            "message": "Kampanya Geçersiz",
            "reason": "Üye bulunamadı"
        }
    
    # Double-check dues eligibility
    is_eligible = await check_member_dues_eligibility(user.get("id"))
    if not is_eligible:
        return {
            "valid": False,
            "message": "Kampanya Geçersiz",
            "reason": "Aidat ödemeleri eksik"
        }
    
    # Get campaign details
    campaign = await db.campaigns.find_one({"id": qr_data.get("campaign_id")})
    
    # Mark QR as used
    await db.qr_tokens.update_one(
        {"token": qr_token},
        {
            "$set": {
                "is_used": True,
                "used_at": current_time
            }
        }
    )
    
    return {
        "valid": True,
        "message": "Kampanyaya Katılabilir",
        "member": {
            "name": user.get("name"),
            "surname": user.get("surname"),
            "photo": user.get("profile_photo"),
            "username": user.get("username")
        },
        "campaign": {
            "title": campaign.get("title") if campaign else "Kampanya",
            "company": campaign.get("company_name") if campaign else "Şirket"
        }
    }

# File serving endpoint instead of StaticFiles
@api_router.get("/uploads/{file_name}")
async def get_uploaded_file(file_name: str):
    file_path = UPLOAD_DIR / file_name
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path)

# File upload routes
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_admin_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya seçilmedi")
    
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["jpg", "jpeg", "png", "gif", "webp"]:
        raise HTTPException(status_code=400, detail="Sadece resim dosyaları yüklenebilir")
    
    # Check file size (5MB limit)
    file_size = 0
    content = await file.read()
    file_size = len(content)
    
    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="Dosya boyutu 5MB'den küçük olmalıdır")
    
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    return {"file_url": f"/api/uploads/{file_id}.{file_extension}"}

# Admin-only endpoint to cleanup and recreate members
@api_router.post("/admin/cleanup-members")
async def cleanup_and_recreate_members(current_user: User = Depends(get_admin_user)):
    try:
        # Delete all non-admin users
        await db.users.delete_many({"is_admin": {"$ne": True}})
        await db.dues.delete_many({})
        
        # Recreate members with correct team assignments
        members_data = [
            # TUĞBA ÇAKI Takımı (Diyojen)
            {"name": "İkbal", "surname": "Karatepe", "team": "Tuğba Çakı"},
            {"name": "Deniz", "surname": "Duygulu", "team": "Tuğba Çakı"},
            {"name": "Nazlı Sena", "surname": "Eser", "team": "Tuğba Çakı"},
            {"name": "Ergun", "surname": "Acar", "team": "Tuğba Çakı"},
            {"name": "Hatice Dilan", "surname": "Genç", "team": "Tuğba Çakı"},
            {"name": "Banu", "surname": "Gümüşkaynak", "team": "Tuğba Çakı"},
            {"name": "Ebru", "surname": "Ateşdağlı", "team": "Tuğba Çakı"},
            {"name": "Hasan Ali", "surname": "Erk", "team": "Tuğba Çakı"},
            {"name": "Mustafa Deniz", "surname": "Özer", "team": "Tuğba Çakı"},
            {"name": "Hüseyin Ertan", "surname": "Sezgin", "team": "Tuğba Çakı"},
            {"name": "Afet", "surname": "Bakay", "team": "Tuğba Çakı"},
            {"name": "Cengiz", "surname": "Karakuzu", "team": "Tuğba Çakı"},
            {"name": "Nadir", "surname": "Şimşek", "team": "Tuğba Çakı"},
            {"name": "Melih", "surname": "Ülgentay", "team": "Tuğba Çakı"},
            {"name": "Elif", "surname": "Alıveren", "team": "Tuğba Çakı"},
            {"name": "Buğra Han", "surname": "Acar", "team": "Tuğba Çakı"},
            {"name": "Bekir Berk", "surname": "Altınay", "team": "Tuğba Çakı"},
            {"name": "Ceyda", "surname": "Çınar", "team": "Tuğba Çakı"},
            {"name": "Ahmet", "surname": "İşleyen", "team": "Tuğba Çakı"},
            {"name": "Abdullah", "surname": "Baş", "team": "Tuğba Çakı"},
            {"name": "Alev", "surname": "Atam", "team": "Tuğba Çakı"},
            {"name": "İzem", "surname": "Karslı", "team": "Tuğba Çakı"},
            {"name": "Özkan", "surname": "Çiğdem", "team": "Tuğba Çakı"},
            {"name": "Berkant", "surname": "Oman", "team": "Tuğba Çakı"},
            {"name": "Beren", "surname": "Karamustafaoğlu", "team": "Tuğba Çakı"},
            {"name": "Demet", "surname": "Aslan", "team": "Tuğba Çakı"},
            {"name": "Ece", "surname": "Kılıç", "team": "Tuğba Çakı"},
            {"name": "Hazal", "surname": "Aktaş", "team": "Tuğba Çakı"},
            
            # DUYGU ASKER AKSOY Takımı
            {"name": "Sultan", "surname": "Güleryüz", "team": "Duygu Asker Aksoy"},
            {"name": "Dilek Şahin", "surname": "Taş", "team": "Duygu Asker Aksoy"},
            {"name": "Merve", "surname": "Dür", "team": "Duygu Asker Aksoy"},
            {"name": "Sinan", "surname": "Telli", "team": "Duygu Asker Aksoy"},
            {"name": "Ebru", "surname": "Polat", "team": "Duygu Asker Aksoy"},
            {"name": "Fatma Neva", "surname": "Şen", "team": "Duygu Asker Aksoy"},
            {"name": "Meltem", "surname": "Sözüer", "team": "Duygu Asker Aksoy"},
            {"name": "Fethiye", "surname": "Turgut", "team": "Duygu Asker Aksoy"},
            {"name": "Şahin Kul", "surname": "O", "team": "Duygu Asker Aksoy"},
            {"name": "Ertuğrul", "surname": "Ceyhan", "team": "Duygu Asker Aksoy"},
            {"name": "İbrahim", "surname": "Şanlı", "team": "Duygu Asker Aksoy"},
            {"name": "İpek", "surname": "Apaydın", "team": "Duygu Asker Aksoy"},
            {"name": "Aslı", "surname": "Cindaruk", "team": "Duygu Asker Aksoy"},
            {"name": "Yadigar", "surname": "Külice", "team": "Duygu Asker Aksoy"},
            {"name": "Volkan", "surname": "Arslan", "team": "Duygu Asker Aksoy"},
            {"name": "Mahir", "surname": "Taşpulat", "team": "Duygu Asker Aksoy"},
            {"name": "Gözde", "surname": "Karadağ", "team": "Duygu Asker Aksoy"},
            {"name": "Rumeysa Nur", "surname": "Öztürk", "team": "Duygu Asker Aksoy"},
            {"name": "Nafiz", "surname": "Selvi", "team": "Duygu Asker Aksoy"},
            {"name": "Elif", "surname": "Kesikçiler", "team": "Duygu Asker Aksoy"},
            {"name": "Özge", "surname": "Türkoğlu", "team": "Duygu Asker Aksoy"},
            {"name": "Damla", "surname": "Ongün", "team": "Duygu Asker Aksoy"},
            {"name": "Simay", "surname": "Cihan", "team": "Duygu Asker Aksoy"},
            {"name": "Ece", "surname": "Arısoy", "team": "Duygu Asker Aksoy"},
            {"name": "Şevval", "surname": "Karaboğa", "team": "Duygu Asker Aksoy"},
            {"name": "Mehmet Emrah", "surname": "Güven", "team": "Duygu Asker Aksoy"},
            {"name": "Hatice", "surname": "Avcı", "team": "Duygu Asker Aksoy"},
            {"name": "Metin Celil", "surname": "Kuşsever", "team": "Duygu Asker Aksoy"},
            
            # SEDA ATEŞ Takımı
            {"name": "Gürhan", "surname": "Aksu", "team": "Seda Ateş"},
            {"name": "Hulusi", "surname": "Karabil", "team": "Seda Ateş"},
            {"name": "Kökten Ulaş", "surname": "Birant", "team": "Seda Ateş"},
            {"name": "Elif", "surname": "Gazel", "team": "Seda Ateş"},
            {"name": "Tayyibe Alpay", "surname": "Uyanıker", "team": "Seda Ateş"},
            {"name": "Eren", "surname": "Özgül", "team": "Seda Ateş"},
            {"name": "Gaye", "surname": "Eren", "team": "Seda Ateş"},
            {"name": "Şafak", "surname": "Sipahi", "team": "Seda Ateş"},
            {"name": "Anıl", "surname": "Özçelik", "team": "Seda Ateş"},
            {"name": "Çağla Beril", "surname": "Karayel", "team": "Seda Ateş"},
            {"name": "Oğuz Serdar", "surname": "Zal", "team": "Seda Ateş"},
            {"name": "Sabri Hakan", "surname": "Dokurlar", "team": "Seda Ateş"},
            {"name": "Ahmet Rasim", "surname": "Burhanoğlu", "team": "Seda Ateş"},
            {"name": "İrem", "surname": "Baysoy", "team": "Seda Ateş"},
            {"name": "Abdülmetin", "surname": "Ürünveren", "team": "Seda Ateş"},
            {"name": "Pelin", "surname": "Baki", "team": "Seda Ateş"},
            {"name": "Esra", "surname": "Tür", "team": "Seda Ateş"},
            {"name": "Leman", "surname": "Atiker", "team": "Seda Ateş"},
            {"name": "Rabia Demir", "surname": "Köse", "team": "Seda Ateş"},
            {"name": "Naci", "surname": "Çobanoğlu", "team": "Seda Ateş"},
            {"name": "Özlem", "surname": "Demir", "team": "Seda Ateş"},
            {"name": "Rahime Gözde", "surname": "Narin", "team": "Seda Ateş"},
            
            # UTKAN DEVRİM ZEYREK Takımı
            {"name": "Saray", "surname": "Kaya", "team": "Utkan Devrim Zeyrek"},
            {"name": "Ulaş", "surname": "Kesikçiler", "team": "Utkan Devrim Zeyrek"},
            {"name": "Elif Tortop", "surname": "Doğan", "team": "Utkan Devrim Zeyrek"},
            {"name": "Zeynep", "surname": "Ermeç", "team": "Utkan Devrim Zeyrek"},
            {"name": "Gül", "surname": "Nacaroğlu", "team": "Utkan Devrim Zeyrek"},
            {"name": "İrem", "surname": "Ayas", "team": "Utkan Devrim Zeyrek"},
            {"name": "Kemal", "surname": "Erkilmen", "team": "Utkan Devrim Zeyrek"},
            {"name": "Senem", "surname": "Ünal", "team": "Utkan Devrim Zeyrek"},
            {"name": "Serkan", "surname": "Salgın", "team": "Utkan Devrim Zeyrek"},
            {"name": "Didem", "surname": "Karabil", "team": "Utkan Devrim Zeyrek"},
            {"name": "Ayşe", "surname": "Tumba", "team": "Utkan Devrim Zeyrek"},
            {"name": "Nur Ayça", "surname": "Öztürk", "team": "Utkan Devrim Zeyrek"},
            {"name": "Tamer", "surname": "Güleryüz", "team": "Utkan Devrim Zeyrek"},
            {"name": "Bülent", "surname": "Erdağı", "team": "Utkan Devrim Zeyrek"},
            {"name": "Ümit", "surname": "Peşeli", "team": "Utkan Devrim Zeyrek"},
            {"name": "Aybike Asena", "surname": "Karakaya", "team": "Utkan Devrim Zeyrek"},
            {"name": "Deniz", "surname": "Genç", "team": "Utkan Devrim Zeyrek"},
            {"name": "Azad Burak", "surname": "Süne", "team": "Utkan Devrim Zeyrek"},
            {"name": "Erdem", "surname": "Kocabay", "team": "Utkan Devrim Zeyrek"},
            {"name": "Rıdvan", "surname": "Baş", "team": "Utkan Devrim Zeyrek"},
            {"name": "Fulya", "surname": "Ersayan", "team": "Utkan Devrim Zeyrek"},
            {"name": "Rasim Can", "surname": "Birol", "team": "Utkan Devrim Zeyrek"},
            {"name": "Dilan", "surname": "Kart", "team": "Utkan Devrim Zeyrek"},
            {"name": "Sıla", "surname": "Timur", "team": "Utkan Devrim Zeyrek"},
            {"name": "Amir", "surname": "Karabuğday", "team": "Utkan Devrim Zeyrek"},
            {"name": "Sude", "surname": "Kahraman", "team": "Utkan Devrim Zeyrek"},
            {"name": "Samet", "surname": "Salık", "team": "Utkan Devrim Zeyrek"},
            {"name": "Erem", "surname": "Kılıç", "team": "Utkan Devrim Zeyrek"},
            {"name": "Seda", "surname": "Baykut", "team": "Utkan Devrim Zeyrek"},
            
            # Test kullanıcısı
            {"name": "Test", "surname": "Kullanıcı", "team": None, "password": "Test567!"}
        ]
        
        # Create password for each member  
        import random
        import string
        
        def generate_password():
            # Generate 8-16 char password with at least 1 letter and 1 special char
            length = random.randint(8, 16)
            letters = string.ascii_letters
            special_chars = "!@#$%^&*"
            
            # Ensure at least 1 letter and 1 special char
            password = random.choice(letters) + random.choice(special_chars)
            
            # Fill the rest
            remaining_chars = letters + string.digits + special_chars
            for _ in range(length - 2):
                password += random.choice(remaining_chars)
            
            # Shuffle the password
            password_list = list(password)
            random.shuffle(password_list)
            return ''.join(password_list)
        
        created_count = 0
        for member_data in members_data:
            # Create username in lowercase format
            name_parts = member_data["name"].lower().split()
            surname_parts = member_data["surname"].lower().split()
            
            # Handle Turkish characters
            turkish_map = {'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'}
            name_clean = name_parts[0]  # Use only first part of name
            surname_clean = surname_parts[0]  # Use only first part of surname
            
            for turkish, ascii_char in turkish_map.items():
                name_clean = name_clean.replace(turkish, ascii_char)
                surname_clean = surname_clean.replace(turkish, ascii_char)
            
            username = f"{name_clean}.{surname_clean}"
            
            # Use custom password if provided, otherwise generate one
            password = member_data.get("password", generate_password())
            
            user_dict = {
                "id": str(uuid.uuid4()),
                "username": username,
                "email": f"{username}@actorclub.com",
                "password": hash_password(password),
                "name": member_data["name"],
                "surname": member_data["surname"],
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
                "board_member": member_data.get("team"),
                "is_admin": False,
                "is_approved": True,
                "created_at": datetime.now(timezone.utc)
            }
            
            user_with_password = UserWithPassword(**user_dict)
            await db.users.insert_one(user_with_password.dict())
            
            # Create dues for the current year
            months = ["Eylül", "Ekim", "Kasım", "Aralık", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"]
            current_year = datetime.now().year
            for month in months:
                dues = Dues(user_id=user_with_password.id, month=month, year=current_year)
                await db.dues.insert_one(dues.dict())
                
            created_count += 1
            
        return {"message": f"Successfully cleaned up and recreated {created_count} members"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleanup failed: {str(e)}")

@api_router.get("/")
async def root():
    return {"message": "Actor Club Portal API"}

# Include the router in the main app
app.include_router(api_router)

# CORS middleware - MUST be added BEFORE StaticFiles
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins for now
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically - AFTER CORS (commented out, using API endpoint instead)
# app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

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