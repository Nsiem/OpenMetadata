# generated by datamodel-codegen:
#   filename:  schema/api/services/updateDatabaseService.json
#   timestamp: 2021-07-31T17:12:10+00:00

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from ...type import jdbcConnection, schedule


class UpdateDatabaseServiceEntityRequest(BaseModel):
    description: Optional[str] = Field(
        None, description='Description of Database entity.'
    )
    jdbc: Optional[jdbcConnection.JdbcInfo] = None
    ingestionSchedule: Optional[
        schedule.TypeUsedForScheduleWithStartTimeAndRepeatFrequency
    ] = Field(None, description='Schedule for running metadata ingestion jobs')