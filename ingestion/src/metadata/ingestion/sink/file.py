import logging
import pathlib

from metadata.config.common import ConfigModel
from metadata.ingestion.api.common import WorkflowContext, Record
from metadata.ingestion.api.sink import Sink, SinkStatus
from metadata.ingestion.ometa.auth_provider import MetadataServerConfig

logger = logging.getLogger(__name__)


class FileSinkConfig(ConfigModel):
    filename: str


class FileSink(Sink):
    config: FileSinkConfig
    report: SinkStatus

    def __init__(self, ctx: WorkflowContext, config: FileSinkConfig, metadata_config: MetadataServerConfig):
        super().__init__(ctx)
        self.config = config
        self.metadata_config = metadata_config
        self.report = SinkStatus()

        fpath = pathlib.Path(self.config.filename)
        self.file = fpath.open("w")
        self.file.write("[\n")
        self.wrote_something = False

    @classmethod
    def create(cls, config_dict: dict, metadata_config_dict: dict, ctx: WorkflowContext):
        config = FileSinkConfig.parse_obj(config_dict)
        metadata_config = MetadataServerConfig.parse_obj(metadata_config_dict)
        return cls(ctx, config, metadata_config)

    def write_record(
        self,
        record: Record
    ) -> None:

        if self.wrote_something:
            self.file.write(",\n")

        self.file.write(record.to_json())
        self.wrote_something = True
        self.report.records_written(record)

    def get_status(self):
        return self.report

    def close(self):
        self.file.write("\n]")
        self.file.close()