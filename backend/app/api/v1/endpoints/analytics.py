from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsDashboardResponse, OverviewMetrics
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/dashboard", response_model=AnalyticsDashboardResponse)
async def get_dashboard_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsDashboardResponse:
    return await analytics_service.get_dashboard_analytics(db, current_user.id)


@router.get("/overview", response_model=OverviewMetrics)
async def get_overview_metrics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OverviewMetrics:
    data = await analytics_service.get_dashboard_analytics(db, current_user.id)
    return data.metrics

