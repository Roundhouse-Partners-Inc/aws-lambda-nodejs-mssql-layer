# aws-lambda-nodejs-mssql-layer

AWS Lambda Layer providing the `mssql` npm package for SQL Server connectivity in Node.js Lambda functions.

## Overview

- **Type**: AWS Lambda Layer
- **Language**: Node.js
- **Dependency**: mssql v12.2.0
- **Supported Runtimes**: Node.js 18.x, 20.x, 22.x

## Build System

- Multi-stage Dockerfile for AWS Lambda Linux environments
- `build.sh` script for version-specific layer builds
- GitHub Actions CI/CD for automated building/testing/publishing

## Project Structure

```
├── Dockerfile          # Multi-stage Docker build
├── build.sh           # Build script for layer creation
├── lambda/            # Example Lambda function code
└── test/              # SQL Server connection tests
```

## Usage

Attach this layer to Lambda functions needing SQL Server database access.
