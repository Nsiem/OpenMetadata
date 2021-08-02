import datetime
import logging
from typing import Optional
from sql_metadata import Parser

from metadata.config.common import ConfigModel
from metadata.ingestion.api.common import WorkflowContext
from metadata.ingestion.api.processor import Processor, ProcessorStatus
from metadata.ingestion.models.table_queries import TableQuery, QueryParserData
from metadata.ingestion.ometa.auth_provider import MetadataServerConfig


class QueryParserProcessorConfig(ConfigModel):
    filter: Optional[str] = None


logger = logging.getLogger(__name__)


class QueryParserProcessor(Processor):
    config: QueryParserProcessorConfig
    status: ProcessorStatus

    def __init__(self, ctx: WorkflowContext, config: QueryParserProcessorConfig, metadata_config: MetadataServerConfig):
        super().__init__(ctx)
        self.config = config
        self.metadata_config = metadata_config
        self.status = ProcessorStatus()

    @classmethod
    def create(cls, config_dict: dict, metadata_config_dict: dict, ctx: WorkflowContext):
        config = QueryParserProcessorConfig.parse_obj(config_dict)
        metadata_config = MetadataServerConfig.parse_obj(metadata_config_dict)
        return cls(ctx, config, metadata_config)

    def process(self, record: TableQuery) -> QueryParserData:
        try:
            start_date = datetime.datetime.strptime(record.analysis_date, '%Y-%m-%d %H:%M:%S').date()
            parser = Parser(record.sql)
            columns_dict = {} if parser.columns_dict == None else parser.columns_dict
            query_parser_data = QueryParserData(tables=parser.tables,
                                                tables_aliases=parser.tables_aliases,
                                                columns=columns_dict,
                                                database=record.database,
                                                sql=record.sql,
                                                date=start_date.strftime('%Y-%m-%d'))
        except Exception as err:
            logger.error(record.sql)
            logger.error(err)
            query_parser_data = None
            pass

        return query_parser_data

    def close(self):
        pass

    def get_status(self) -> ProcessorStatus:
        return self.status