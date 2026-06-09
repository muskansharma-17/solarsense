from sqlalchemy import Boolean, Column, Integer, String, Float, JSON
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(120), unique=True, index=True)
    phone = Column(String(20))
    password = Column(String(255))


class SolarResult(Base):
    __tablename__ = "solar_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)

    rooftop_area_sqft = Column(Float)
    average_monthly_units = Column(Float)
    daily_units = Column(Float)

    recommended_kw = Column(Float)
    dc_capacity_kw = Column(Float)
    ac_capacity_kw = Column(Float)

    panel_count = Column(Integer)
    required_area_sqft = Column(Float)
    required_area_sqm = Column(Float)

    monthly_production_kwh = Column(Float)
    yearly_production_kwh = Column(Float)

    estimated_cost = Column(Float)
    subsidy_amount = Column(Float)
    final_cost_after_subsidy = Column(Float)

    monthly_saving = Column(Float)
    yearly_saving = Column(Float)
    payback_period_years = Column(Float)


class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(150))
    vendor_name = Column(String(100))
    phone = Column(String(20))
    email = Column(String(120), unique=True, index=True)

    website = Column(String(255))
    linkedin_url = Column(String(255))

    city = Column(String(100))
    service_area = Column(String(255))

    total_installed_kw = Column(Float)
    completed_projects = Column(Integer)

    experience_type = Column(String(100))
    google_reviews_count = Column(Integer)

    mnre_approved = Column(Boolean, default=False)
    discom_approved = Column(Boolean, default=False)

    warranty_years = Column(Integer)
    panel_brands = Column(String(255))
    google_rating = Column(Float, default=0.0)


class BillUpload(Base):
    __tablename__ = "bill_uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255))
    file_path = Column(String(255))


class SiteAnalysis(Base):
    __tablename__ = "site_analysis"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    address = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    rooftop_area_sqft = Column(Float)
    rooftop_area_sqm = Column(Float)
    max_possible_kw = Column(Float)


class WeatherSolarData(Base):
    __tablename__ = "weather_solar_data"

    id = Column(Integer, primary_key=True, index=True)
    site_id = Column(Integer)
    weather_dataset = Column(String(255))
    average_sun_hours = Column(Float)
    daily_generation = Column(Float)
    monthly_generation = Column(Float)
    yearly_generation = Column(Float)


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(100))
    phone = Column(String(20))
    city = Column(String(100))
    requirement = Column(String(255))
    vendor_id = Column(Integer)


class ProposalData(Base):
    __tablename__ = "proposal_data"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String(100))
    location = Column(String(255))

    system_size_ac = Column(Float)
    system_size_dc = Column(Float)

    estimated_savings = Column(Float)
    payback_period = Column(Float)
    roi_25_years = Column(Float)

    annual_generation = Column(Float)
    monthly_generation = Column(JSON)

    avg_sun_hours = Column(Float)
    avg_temperature = Column(Float)
    solar_irradiation = Column(Float)
    monthly_irradiation = Column(JSON)

    total_investment = Column(Float)
    irr = Column(Float)

    co2_reduced = Column(Float)
    trees_saved = Column(Float)
    coal_saved = Column(Float)
    km_not_driving = Column(Float)
    clean_energy = Column(Float)