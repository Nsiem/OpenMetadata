import logging
import os
import pathlib
import sys

import click
from pydantic import ValidationError

from metadata.check.check_cli import check
from metadata.config.config_loader import load_config_file
from metadata.ingestion.workflow.workflow import Workflow

logger = logging.getLogger(__name__)

logging.getLogger("urllib3").setLevel(logging.WARN)

# Configure logger.
BASE_LOGGING_FORMAT = (
    "[%(asctime)s] %(levelname)-8s {%(name)s:%(lineno)d} - %(message)s"
)
logging.basicConfig(format=BASE_LOGGING_FORMAT)


@click.group()
@click.option("--debug/--no-debug", default=False)
def metadata(debug: bool) -> None:
    if debug or os.getenv("METADATA_DEBUG", False):
        logging.getLogger().setLevel(logging.INFO)
        logging.getLogger("metadata").setLevel(logging.DEBUG)
    else:
        logging.getLogger().setLevel(logging.WARNING)
        logging.getLogger("metadata").setLevel(logging.INFO)


@metadata.command()
@click.option(
    "-c",
    "--config",
    type=click.Path(exists=True, dir_okay=False),
    help="Config file in .toml or .yaml format",
    required=True,
)
def ingest(config: str) -> None:
    """Main command for ingesting metadata into Metadata"""

    config_file = pathlib.Path(config)
    workflow_config = load_config_file(config_file)

    try:
        logger.info(f"Using config: {workflow_config}")
        del workflow_config['cron']
        workflow = Workflow.create(workflow_config)
    except ValidationError as e:
        click.echo(e, err=True)
        sys.exit(1)

    workflow.execute()
    ret = workflow.print_status()
    sys.exit(ret)


metadata.add_command(check)