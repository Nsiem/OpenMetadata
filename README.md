<div align="center">
  <img src="https://i.imgur.com/5VumwFS.png" align="center" alt="OpenMetadata" height="90"/>
  <hr />

[![Build Status](https://github.com/StreamlineData/catalog/actions/workflows/maven-build.yml/badge.svg?event=push)](https://github.com/StreamlineData/catalog/actions/workflows/maven-build.yml)
[![Release](https://img.shields.io/github/release/StreamlineData/catalog/all.svg)](https://github.com/StreamlineData/catalog/releases)
[![Twitter Follow](https://img.shields.io/twitter/follow/open_metadata?style=social)](https://twitter.com/intent/follow?screen_name=open_metadata)
[![License](https://img.shields.io/github/license/StreamlineData/catalog.svg)](LICENSE)

</div>

- [What is OpenMetadata?](#what-is-openmetadata )
- [Features](#features)
- [Building OpenMetadata](#building-openmetadata)
- [Running OpenMetadata via Docker](#running-openmetadata-via-docker)
- [Documentation](#documentation)
- [License](#license)

# What is OpenMetadata?
[OpenMetadata](https://open-metadata.org/) is a ...

## Features

## Building OpenMetadata
### Set up mysql database used as OpenMetadata backend
```shell
mysql -u username -p (Enter password when prompted)

mysql> CREATE USER 'catalog_user'@'%' IDENTIFIED WITH mysql_native_password BY 'catalog_password';
mysql> CREATE DATABASE catalog_db;
mysql> GRANT ALL PRIVILEGES ON catalog_db.* TO 'catalog_user'@'%' IDENTIFIED BY 'catalog_password';
mysql> FLUSH PRIVILEGES;
```

### Build OpenMetdata project and run it
Make sure mysql is running with credentials user 'catalog_user' with password 'catalog_password'.
Connect to mysql following steps mentioned [here](#steps-to-connect-mysql).

```shells
mvn -DskipTests clean package
cd dist/target
tar zxvf catalog-1.0.0-SNAPSHOT.tar.gz
cd catalog-1.0.0-SNAPSHOT/bootstrap
./bootstrap_storage.sh migrate
cd ../
```
If authorizer is configured, run:
```
./bin/catalog-server-start.sh conf/catalog-security.yaml
```
otherwise run
```
./bin/catalog-server-start.sh conf/catalog.yaml
```
Open browser http://localhost:8585/ to start the UI.\
Open browser http://localhost:8585/api/swagger to look at API documentation.

### Setup Authorizer Configuration
Enter following information in ***/conf/catalog-security.yaml*** file:
```
authorizerConfiguration:
  className: <authorizer_classname>
  containerRequestFilter: <JWT-filter>
  publicKeyUri: <sign-on_provider_public-key>
  clientAuthorizer:
    authority: <sign-on_issuer-url>
    client_id: <sign-on_client_id>
```


## Running OpenMetadata via Docker
```shell
cd docker/metadata/
docker-compose build
docker-compose up
```
Open browser http://localhost:8585/ to start the UI.\
Open browser http://localhost:8585/api/swagger to look at API documentation.


## Documentation
Check out [OpenMetadata documentation](https://docs.open-metadata.org/) for a complete description of OpenMetadata's features.

## License
OpenMetadata is under [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)