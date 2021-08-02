# generated by datamodel-codegen:
#   filename:  data/tags/piiTags.json
#   timestamp: 2021-07-31T17:12:10+00:00

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class Model(BaseModel):
    __root__: Any = Field(
        ...,
        description='Personally Identifiable Information information that, when used alone or with other relevant data, can identify an individual.',
    )