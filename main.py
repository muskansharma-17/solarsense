import os
import shutil
from dotenv import load_dotenv
from google import genai
from fastapi import Query

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, HttpUrl, EmailStr
from typing import Literal

from database import engine, SessionLocal
from models import Base, User, Vendor, SolarResult, SiteAnalysis, WeatherSolarData, Inquiry, BillUpload

from fastapi.responses import HTMLResponse

from models import ProposalData
from database import Base, engine, SessionLocal

import requests
from datetime import date, timedelta
from typing import List
from typing import Annotated

from bill_ocr import process_multiple_bills

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ADMIN_EMAIL = "admin@solarsense.com"
ADMIN_PASSWORD = "123456"

vendors = []
users = []
reports = []
latest_bill_paths = []


load_dotenv()



# =========================
# INPUT MODELS
# =========================

class AdminLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class VendorCreate(BaseModel):
    company_name: str
    vendor_name: str
    phone: str
    email: str
    website: str
    linkedin_url: str
    city: str
    service_area: str
    total_installed_kw: float
    completed_projects: int
    experience_type: str
    google_reviews_count: int
    mnre_approved: bool
    discom_approved: bool
    warranty_years: int
    panel_brands: str
    google_rating: float = 0.0

class VendorRating(BaseModel):
    rating: float

class BillUploadResponse(BaseModel):
    id: int
    filename: str
    file_path: str

    class Config:
        from_attributes = True

class SiteAnalysisRequest(BaseModel):
    user_id: int
    address: str
    location: str
    latitude: float
    longitude: float

class WeatherSolarRequest(BaseModel):

    user_id: int

class InquiryCreate(BaseModel):
    customer_name: str
    phone: str
    city: str
    requirement: str
    vendor_id: int

class SolarChatRequest(BaseModel):
    question: str


    filename: str
    file_path: str

# =========================
# HOME API
# =========================

@app.get("/")
def home():
    return {"message": "SolarSense Backend Running"}

@app.get("/upload-page", response_class=HTMLResponse)
def upload_page():

    return 
    
# =========================
# 1. USER API
# =========================

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    email = user.email.strip().lower()

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        return {
            "success": False,
            "message": "Email already registered"
        }

    new_user = User(
        name=user.name,
        email=email,
        phone=user.phone,
        password=user.password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "success": True,
        "message": "User saved successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email,
        "phone": new_user.phone
    }


@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.email == user.email.strip().lower()
    ).first()

    if not existing_user:

        return {
            "success": False,
            "message": "User not found"
        }

    if existing_user.password != user.password:

        return {
            "success": False,
            "message": "Incorrect password"
        }

    return {
        "success": True,
        "message": "Login successful",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email
    }

# =========================
# 2. Vendor API
# =========================

@app.post("/register-vendor")
def register_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):

    email = vendor.email.strip().lower()

    existing_vendor = db.query(Vendor).filter(
        Vendor.email == email
    ).first()

    if existing_vendor:
        return {
            "success": False,
            "message": "Vendor email already registered"
        }

    new_vendor = Vendor(
        company_name=vendor.company_name,
        vendor_name=vendor.vendor_name,
        phone=vendor.phone,
        email=email,
        website=str(vendor.website),
        linkedin_url=str(vendor.linkedin_url),
        city=vendor.city,
        service_area=vendor.service_area,
        total_installed_kw=vendor.total_installed_kw,
        completed_projects=vendor.completed_projects,
        experience_type=vendor.experience_type,
        google_rating=vendor.google_rating,
        google_reviews_count=vendor.google_reviews_count,
        mnre_approved=vendor.mnre_approved,
        discom_approved=vendor.discom_approved,
        warranty_years=vendor.warranty_years,
        panel_brands=vendor.panel_brands
    )

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return {
        "success": True,
        "message": "Vendor registered successfully",
        "vendor_id": new_vendor.id,
        "company_name": new_vendor.company_name
    }


@app.get("/vendors")
def get_vendors(db: Session = Depends(get_db)):

    vendors = db.query(Vendor).order_by(
        Vendor.google_rating.desc()
    ).all()

    return {
        "success": True,
        "vendors": vendors
    }


@app.get("/vendors/filter")
def filter_vendors(
    city: str = "",
    min_rating: float = 0,
    min_kw: float = 0,
    min_projects: int = 0,
    sort_by: str = "rating",
    order: str = "desc",
    db: Session = Depends(get_db)
):

    query = db.query(Vendor)

    if city:
        query = query.filter(
            Vendor.city.ilike(f"%{city}%")
        )

    if min_rating:
        query = query.filter(
            Vendor.google_rating >= min_rating
        )

    if min_kw:
        query = query.filter(
            Vendor.total_installed_kw >= min_kw
        )

    if min_projects:
        query = query.filter(
            Vendor.completed_projects >= min_projects
        )

    sort_columns = {
        "rating": Vendor.google_rating,
        "google_rating": Vendor.google_rating,
        "kw": Vendor.total_installed_kw,
        "projects": Vendor.completed_projects,
        "city": Vendor.city,
        "company": Vendor.company_name
    }

    sort_column = sort_columns.get(sort_by, Vendor.google_rating)

    if order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    vendors = query.all()

    return {
        "success": True,
        "vendors": vendors
    }


@app.get("/vendors/{vendor_id}")
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        raise HTTPException(
            status_code=404,
            detail="Vendor not found"
        )

    return {
        "success": True,
        "vendor": vendor
    }

# =========================
# 3. admin control API
# =========================

@app.post("/admin/login")
def admin_login(data: AdminLogin):
    if data.email == ADMIN_EMAIL and data.password == ADMIN_PASSWORD:
        return {
            "success": True,
            "message": "Admin login successful",
            "role": "admin"
        }

    return {
        "success": False,
        "message": "Invalid admin email or password"
    }


@app.get("/admin/dashboard")
def admin_dashboard(db: Session = Depends(get_db)):

    total_users = db.query(User).count()
    total_vendors = db.query(Vendor).count()
    total_reports = db.query(SolarResult).count()
    total_bill_uploads = db.query(BillUpload).count()

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_vendors": total_vendors,
            "total_reports": total_reports,
            "total_bill_uploads": total_bill_uploads
        }
    }


@app.get("/admin/users")
def get_all_users(db: Session = Depends(get_db)):

    users = db.query(User).all()

    return {
        "success": True,
        "users": users
    }

@app.get("/admin/reports")
def get_all_reports(db: Session = Depends(get_db)):

    reports = db.query(SolarResult).order_by(SolarResult.id.desc()).all()
    output = []

    for report in reports:
        user = db.query(User).filter(User.id == report.user_id).first()

        site = db.query(SiteAnalysis).filter(
            SiteAnalysis.user_id == report.user_id
        ).order_by(SiteAnalysis.id.desc()).first()

        output.append({
            "id": report.id,
            "user_name": user.name if user else "-",
            "location": site.address if site and site.address else "-",
            "city": site.address.split(",")[0] if site and site.address else "-",
            "recommended_kw": report.recommended_kw,
            "yearly_saving": report.yearly_saving,
            "monthly_saving": report.monthly_saving,
            "payback_period_years": report.payback_period_years,
            "status": "Completed"
        })

    return {
        "success": True,
        "reports": output
    }

@app.post("/admin/vendors")
def add_vendor(vendor: VendorCreate, db: Session = Depends(get_db)):

    existing_vendor = db.query(Vendor).filter(
        Vendor.email == vendor.email.strip().lower()
    ).first()

    if existing_vendor:
        return {
            "success": False,
            "message": "Vendor email already registered"
        }

    new_vendor = Vendor(
        company_name=vendor.company_name,
        vendor_name=vendor.vendor_name,
        phone=vendor.phone,
        email=vendor.email.strip().lower(),
        website=str(vendor.website),
        linkedin_url=str(vendor.linkedin_url),
        city=vendor.city,
        service_area=vendor.service_area,
        total_installed_kw=vendor.total_installed_kw,
        completed_projects=vendor.completed_projects,
        experience_type=vendor.experience_type,
        google_reviews_count=vendor.google_reviews_count,
        mnre_approved=vendor.mnre_approved,
        discom_approved=vendor.discom_approved,
        warranty_years=vendor.warranty_years,
        panel_brands=vendor.panel_brands,
        google_rating=vendor.google_rating
    )

    db.add(new_vendor)
    db.commit()
    db.refresh(new_vendor)

    return {
        "success": True,
        "message": "Vendor added successfully",
        "vendor": new_vendor
    }


@app.get("/admin/vendors")
def get_admin_vendors(db: Session = Depends(get_db)):

    vendors = db.query(Vendor).all()

    return {
        "success": True,
        "vendors": vendors
    }


@app.delete("/admin/vendors/{vendor_id}")
def delete_vendor(vendor_id: int, db: Session = Depends(get_db)):

    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id
    ).first()

    if not vendor:
        return {
            "success": False,
            "message": "Vendor not found"
        }

    db.delete(vendor)
    db.commit()

    return {
        "success": True,
        "message": "Vendor deleted successfully"
    }


# =========================
# 4. Bill Upload / OCR API
# =========================

@app.post("/upload-bills")
async def upload_bills(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    global latest_bill_paths

    saved_paths = []
    saved_bills = []

    for file in files:
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        bill_upload = BillUpload(
            filename=file.filename,
            file_path=file_path
        )

        db.add(bill_upload)
        db.commit()
        db.refresh(bill_upload)

        saved_paths.append(file_path)

        saved_bills.append({
            "id": bill_upload.id,
            "filename": bill_upload.filename,
            "file_path": bill_upload.file_path
        })

    latest_bill_paths = saved_paths

    result = process_multiple_bills(saved_paths)

    return {
        "success": True,
        "message": "Bills uploaded and saved in MySQL successfully",
        "saved_files": saved_bills,
        "data": result
    }
# =========================
# 5. SOLAR CALCULATOR API
# =========================
@app.get("/calculate-solar-from-bill")
def calculate_solar_from_bill(
    user_id: int,
    db: Session = Depends(get_db)
):

    latest_bill = db.query(BillUpload).order_by(BillUpload.id.desc()).first()

    if not latest_bill:
        return {
            "success": False,
            "message": "Please upload bills first"
        }

    bill_result = process_multiple_bills([latest_bill.file_path])

    if not bill_result:
        return {
            "success": False,
            "message": "Bill read failed"
        }

    first_bill = bill_result[0]

    recommended_kw = float(first_bill["recommended_solar_kw"])
    last_6_units = first_bill["last_6_month_units"]

    clean_units = []

    for item in last_6_units:
        if isinstance(item, dict):
            unit = (
                item.get("units")
                or item.get("unit")
                or item.get("consumption")
                or item.get("current_units")
                or 0
            )
        else:
            unit = item

        clean_units.append(float(unit))

    if not clean_units:
        return {
            "success": False,
            "message": "Last 6 month units not found"
        }

    average_monthly_units = round(sum(clean_units) / len(clean_units), 2)
    daily_units = round(average_monthly_units / 30, 2)

    dc_capacity_kw = recommended_kw
    ac_capacity_kw = round(recommended_kw * 0.80, 2)

    monthly_production = round(recommended_kw * 5.5 * 30 * 0.80, 2)
    yearly_production = round(monthly_production * 12, 2)

    panel_count = int(recommended_kw * 3)

    required_area_sqft = panel_count * 20
    required_area_sqm = round(required_area_sqft * 0.092903, 2)

    estimated_cost = round(recommended_kw * 60000, 2)

    if recommended_kw <= 1:
        subsidy = 30000
    elif recommended_kw <= 2:
        subsidy = 60000
    else:
        subsidy = 78000

    final_cost_after_subsidy = estimated_cost - subsidy
    if final_cost_after_subsidy < 0:
        final_cost_after_subsidy = 0

    monthly_saving = round(monthly_production * 8, 2)
    yearly_saving = round(monthly_saving * 12, 2)

    if yearly_saving > 0:
        payback_period = round(final_cost_after_subsidy / yearly_saving, 1)
    else:
        payback_period = 0

    new_report = SolarResult(
        user_id=user_id,
        rooftop_area_sqft=required_area_sqft,
        average_monthly_units=average_monthly_units,
        daily_units=daily_units,
        recommended_kw=recommended_kw,
        dc_capacity_kw=dc_capacity_kw,
        ac_capacity_kw=ac_capacity_kw,
        panel_count=panel_count,
        required_area_sqft=required_area_sqft,
        required_area_sqm=required_area_sqm,
        monthly_production_kwh=monthly_production,
        yearly_production_kwh=yearly_production,
        estimated_cost=estimated_cost,
        subsidy_amount=subsidy,
        final_cost_after_subsidy=final_cost_after_subsidy,
        monthly_saving=monthly_saving,
        yearly_saving=yearly_saving,
        payback_period_years=payback_period
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "success": True,
        "report_id": new_report.id,

        "recommended_solar_capacity": f"{recommended_kw} kW",
        "recommended_solar_kw": recommended_kw,

        "current_units": first_bill.get("current_units", 0),
        "last_6_month_units": clean_units,

        "average_monthly_units": average_monthly_units,
        "daily_units": daily_units,

        "dc_capacity_kw": dc_capacity_kw,
        "ac_capacity_kw": ac_capacity_kw,

        "monthly_production": f"{monthly_production} kWh",
        "yearly_production": f"{yearly_production} kWh",
        "monthly_production_kwh": monthly_production,
        "yearly_production_kwh": yearly_production,

        "panel_count": panel_count,
        "required_area_sqft": required_area_sqft,
        "required_area_sqm": required_area_sqm,

        "estimated_cost": f"₹{estimated_cost}",
        "estimated_cost_value": estimated_cost,

        "subsidy": f"₹{subsidy}",
        "subsidy_amount": subsidy,

        "final_cost_after_subsidy": f"₹{final_cost_after_subsidy}",
        "final_cost_after_subsidy_value": final_cost_after_subsidy,

        "monthly_saving": f"₹{monthly_saving}",
        "monthly_saving_value": monthly_saving,

        "yearly_saving": f"₹{yearly_saving}",
        "yearly_saving_value": yearly_saving,

        "payback_period": f"{payback_period} Years",
        "payback_period_years": payback_period
    }

@app.get("/solar-results")
def get_solar_results():

    db = SessionLocal()

    results = db.query(SolarResult).all()

    output = []

    for result in results:
        output.append({
            "calculation_id": result.id,
            "user_id": result.user_id,

            "rooftop_area": f"{result.rooftop_area_sqft} sqft",

            "average_monthly_units": f"{result.average_monthly_units} Units",
            "daily_units": f"{result.daily_units} Units",

            "recommended_solar_capacity": f"{result.recommended_kw} kW",

            "dc_capacity": f"{result.dc_capacity_kw} kW",
            "ac_capacity": f"{result.ac_capacity_kw} kW",

            "panel_count": f"{result.panel_count} Panels",

            "required_area_sqft": f"{result.required_area_sqft} sqft",
            "required_area_sqm": f"{result.required_area_sqm} sqm",

            "monthly_production": f"{result.monthly_production_kwh} kWh",
            "yearly_production": f"{result.yearly_production_kwh} kWh",

            "estimated_cost": f"₹{result.estimated_cost}",
            "subsidy": f"₹{result.subsidy_amount}",
            "final_cost_after_subsidy": f"₹{result.final_cost_after_subsidy}",

            "monthly_saving": f"₹{result.monthly_saving}",
            "yearly_saving": f"₹{result.yearly_saving}",

            "payback_period": f"{result.payback_period_years} Years"
        })

    return output

# =========================
# 6. SITE ANALYSIS API
# =========================
@app.post("/site-analysis")
def site_analysis(
    request: SiteAnalysisRequest,
    db: Session = Depends(get_db)
):
    try:
        site = SiteAnalysis(
            user_id=request.user_id,
            address=request.address or request.location,
            latitude=request.latitude,
            longitude=request.longitude,
            rooftop_area_sqft=0,
            rooftop_area_sqm=0,
            max_possible_kw=0
        )

        db.add(site)
        db.commit()
        db.refresh(site)

        return {
            "success": True,
            "site_id": site.id,
            "user_id": site.user_id,
            "address": site.address,
            "latitude": site.latitude,
            "longitude": site.longitude,
            "solar_score": 85,
            "site_quality": "Good",
            "shadow_risk": "Low",
            "sunlight_hours": 5.5,
            "message": "Site analysis saved successfully"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# =========================
# 7. WEATHER + SOLAR GENERATION API
# =========================

@app.post("/weather-solar")
def weather_solar(data: WeatherSolarRequest):

    db = SessionLocal()

    site = db.query(SiteAnalysis).filter(
        SiteAnalysis.user_id == data.user_id
    ).order_by(SiteAnalysis.id.desc()).first()

    if site is None:
        raise HTTPException(
            status_code=404,
            detail="Site analysis not found"
        )

    solar_result = db.query(SolarResult).filter(
        SolarResult.user_id == data.user_id
    ).order_by(SolarResult.id.desc()).first()

    if solar_result is None:
        raise HTTPException(
            status_code=404,
            detail="Solar calculation not found"
        )

    average_sun_hours = 5.5

    monthly_generation = round(
        solar_result.recommended_kw *
        average_sun_hours *
        30 *
        0.80,
        2
    )

    yearly_generation = round(
        monthly_generation * 12,
        2
    )

    weather_data = WeatherSolarData(

        site_id=site.id,

        weather_dataset="NASA POWER",

        average_sun_hours=average_sun_hours,

        daily_generation=round(monthly_generation / 30, 2),

        monthly_generation=monthly_generation,

        yearly_generation=yearly_generation
    )

    db.add(weather_data)

    db.commit()

    db.refresh(weather_data)

    return {

        "site_address":
        site.address,

        "weather_dataset":
        weather_data.weather_dataset,

        "average_sun_hours":
        f"{average_sun_hours} Hours/Day",

        "recommended_solar_capacity":
        f"{solar_result.recommended_kw} kW",

        "daily_generation":
        f"{weather_data.daily_generation} kWh",

        "monthly_generation":
        f"{weather_data.monthly_generation} kWh",

        "yearly_generation":
        f"{weather_data.yearly_generation} kWh",

        "weather_condition":
        "Excellent Solar Irradiance",

        "solar_potential":
        "High",

        "temperature_range":
        "25°C - 38°C",

        "annual_irradiance":
        "5.5 kWh/m²/day"
    }

# =========================
# 8. Inquiry API
# =========================

@app.post("/send-inquiry")
def send_inquiry(data: InquiryCreate):

    db = SessionLocal()

    vendor = db.query(Vendor).filter(
        Vendor.id == data.vendor_id
    ).first()

    if vendor is None:
        raise HTTPException(status_code=404, detail="Vendor not found")

    inquiry = Inquiry(
        customer_name=data.customer_name,
        phone=data.phone,
        city=data.city,
        requirement=data.requirement,
        vendor_id=data.vendor_id
    )

    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)

    return {
        "message": "Inquiry sent successfully",
        "inquiry_id": inquiry.id,
        "vendor_id": inquiry.vendor_id
    }

@app.get("/inquiries")
def get_inquiries():

    db = SessionLocal()

    inquiries = db.query(Inquiry).all()

    return inquiries


# =========================
# 9. MONTHLY SOLAR PRODUCTION CHART API
# =========================

@app.get("/generation-chart")
def generation_chart(
    solar_kw: float = Query(..., description="Recommended solar capacity in kW")
):

    monthly_sun_hours = {
        "Jan": 5.1,
        "Feb": 5.5,
        "Mar": 6.0,
        "Apr": 6.3,
        "May": 6.1,
        "Jun": 5.2,
        "Jul": 4.6,
        "Aug": 4.8,
        "Sep": 5.1,
        "Oct": 5.6,
        "Nov": 5.4,
        "Dec": 5.0
    }

    chart_data = []

    for month, sun_hours in monthly_sun_hours.items():
        monthly_generation = round(
            solar_kw * sun_hours * 30 * 0.80,
            2
        )

        chart_data.append({
            "month": month,
            "sun_hours": sun_hours,
            "monthly_generation": monthly_generation
        })

    yearly_generation = round(
        sum(item["monthly_generation"] for item in chart_data),
        2
    )

    return {
        "success": True,
        "solar_kw": solar_kw,
        "chart_title": "Monthly Solar Production",
        "chart_unit": "kWh",
        "chart_data": chart_data,
        "yearly_generation": yearly_generation,
        "daily_average": round(yearly_generation / 365, 2),
        "specific_yield": round((yearly_generation / 365) / solar_kw, 2) if solar_kw > 0 else 0
    }


@app.get("/bill-chart")
def bill_chart(monthly_bill: float, solar_capacity_kw: float):

    monthly_sun_hours = {
        "Jan": 5.1,
        "Feb": 5.5,
        "Mar": 6.0,
        "Apr": 6.3,
        "May": 6.1,
        "Jun": 5.2,
        "Jul": 4.6,
        "Aug": 4.8,
        "Sep": 5.1,
        "Oct": 5.6,
        "Nov": 5.4,
        "Dec": 5.0
    }

    electricity_rate = 6.5
    chart_data = []

    for month, sun_hours in monthly_sun_hours.items():

        monthly_generation = round(solar_capacity_kw * sun_hours * 30 * 0.80, 2)

        solar_saving = round(monthly_generation * electricity_rate, 2)

        bill_after_solar = monthly_bill - solar_saving

        if bill_after_solar < 0:
            bill_after_solar = 0

        chart_data.append({
            "month": month,
            "monthly_generation_kwh": monthly_generation,
            "bill_without_solar": monthly_bill,
            "solar_saving": solar_saving,
            "bill_after_solar": round(bill_after_solar, 2)
        })

    yearly_bill_without_solar = monthly_bill * 12
    yearly_bill_after_solar = round(
        sum(item["bill_after_solar"] for item in chart_data),
        2
    )
    yearly_saving = round(yearly_bill_without_solar - yearly_bill_after_solar, 2)

    return {
        "monthly_bill_input": monthly_bill,
        "solar_capacity_kw": solar_capacity_kw,
        "electricity_rate_per_unit": electricity_rate,
        "chart_data": chart_data,
        "yearly_bill_without_solar": yearly_bill_without_solar,
        "yearly_bill_after_solar": yearly_bill_after_solar,
        "yearly_saving": yearly_saving
    }

# =========================
# 10. Proposal API
# =========================

@app.post("/save-proposal")
def save_proposal(data: dict):
    db = SessionLocal()

    proposal = ProposalData(
        customer_name=data.get("customer_name"),
        location=data.get("location"),

        system_size_ac=data.get("system_size_ac"),
        system_size_dc=data.get("system_size_dc"),

        estimated_savings=data.get("estimated_savings"),
        payback_period=data.get("payback_period"),
        roi_25_years=data.get("roi_25_years"),

        annual_generation=data.get("annual_generation"),
        monthly_generation=data.get("monthly_generation"),

        avg_sun_hours=data.get("avg_sun_hours"),
        avg_temperature=data.get("avg_temperature"),
        solar_irradiation=data.get("solar_irradiation"),
        monthly_irradiation=data.get("monthly_irradiation"),

        total_investment=data.get("total_investment"),
        irr=data.get("irr"),

        co2_reduced=data.get("co2_reduced"),
        trees_saved=data.get("trees_saved"),
        coal_saved=data.get("coal_saved"),
        km_not_driving=data.get("km_not_driving"),
        clean_energy=data.get("clean_energy"),
    )

    db.add(proposal)
    db.commit()
    db.refresh(proposal)

    return {
        "success": True,
        "message": "Proposal saved successfully",
        "proposal_id": proposal.id
    }

@app.get("/proposal-output")
def proposal_output():
    db = SessionLocal()

    proposal = db.query(ProposalData).order_by(ProposalData.id.desc()).first()

    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")

    return proposal