from typing import Optional, Tuple

# This import verifies that the dependencies are available.
import pybigquery  # noqa: F401

from .sql_source import BasicSQLAlchemyConfig, SQLAlchemySource
from ..ometa.auth_provider import MetadataServerConfig


class BigQueryConfig(BasicSQLAlchemyConfig):
    scheme = "bigquery"
    project_id: Optional[str] = None

    def get_sql_alchemy_url(self):
        if self.project_id:
            return f"{self.scheme}://{self.project_id}"
        return f"{self.scheme}://"

    def get_identifier(self, schema: str, table: str) -> str:
        if self.project_id:
            return f"{self.project_id}.{schema}.{table}"
        return f"{schema}.{table}"

    def standardize_schema_table_names(
        self, schema: str, table: str
    ) -> Tuple[str, str]:
        segments = table.split(".")
        if len(segments) != 2:
            raise ValueError(f"expected table to contain schema name already {table}")
        if segments[0] != schema:
            raise ValueError(f"schema {schema} does not match table {table}")
        return segments[0], segments[1]


class BigQuerySource(SQLAlchemySource):
    def __init__(self, config, metadata_config, ctx):
        super().__init__(config, metadata_config, ctx, "bigquery")

    @classmethod
    def create(cls, config_dict, metadata_config_dict, ctx):
        config = BigQueryConfig.parse_obj(config_dict)
        metadata_config = MetadataServerConfig.parse_obj(metadata_config_dict)
        return cls(config, metadata_config, ctx)