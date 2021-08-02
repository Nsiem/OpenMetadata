#!/usr/bin/env bash

# Resolve links - $0 may be a softlink
PRG="${0}"

while [ -h "${PRG}" ]; do
  ls=`ls -ld "${PRG}"`
  link=`expr "$ls" : '.*-> \(.*\)$'`
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG=`dirname "${PRG}"`/"$link"
  fi
done

BOOTSTRAP_DIR=`dirname ${PRG}`
CONFIG_FILE_PATH=${BOOTSTRAP_DIR}/../conf/catalog.yaml
SCRIPT_ROOT_DIR="${BOOTSTRAP_DIR}/sql"

# Which java to use
if [ -z "${JAVA_HOME}" ]; then
  JAVA="java"
else
  JAVA="${JAVA_HOME}/bin/java"
fi

TABLE_INITIALIZER_MAIN_CLASS=org.openmetadata.catalog.util.TablesInitializer
for file in "${BOOTSTRAP_DIR}"/../libs/*.jar;
do
    CLASSPATH="$CLASSPATH":"$file"
done


execute() {
    echo "Using Configuration file: ${CONFIG_FILE_PATH}"
    ${JAVA} -Dbootstrap.dir=$BOOTSTRAP_DIR  -cp ${CLASSPATH} ${TABLE_INITIALIZER_MAIN_CLASS} -c ${CONFIG_FILE_PATH} -s ${SCRIPT_ROOT_DIR} --${1}
}

printUsage() {
    cat <<-EOF
USAGE: $0 [create|migrate|info|validate|drop|drop-create|repair|check-connection]
   create           : Creates the tables. The target database should be empty
   migrate          : Migrates the database to the latest version or creates the tables if the database is empty. Use "info" to see the current version and the pending migrations
   info             : Shows the list of migrations applied and the pending migration waiting to be applied on the target database
   validate         : Checks if the all the migrations haven been applied on the target database
   drop             : Drops all the tables in the target database
   drop-create      : Drops and recreates all the tables in the target database.
   repair           : Repairs the DATABASE_CHANGE_LOG table which is used to track all the migrations on the target database.
                      This involves removing entries for the failed migrations and update the checksum of migrations already applied on the target databsase.
   check-connection : Checks if a connection can be sucessfully obtained for the target database
EOF
}

if [ $# -gt 1 ]
then
    echo "More than one argument specified, please use only one of the below options"
    printUsage
    exit 1
fi

opt="$1"

case "${opt}" in
create | drop | migrate | info | validate | repair | check-connection )
    execute "${opt}"
    ;;
drop-create )
    execute "drop" && execute "create"
    ;;
*)
    printUsage
    exit 1
    ;;
esac