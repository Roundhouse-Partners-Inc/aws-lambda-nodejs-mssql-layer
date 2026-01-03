# AWS Lambda Node.js MSSQL Layer

AWS Lambda Layer providing [mssql](https://www.npmjs.com/package/mssql) for SQL Server connectivity in Node.js Lambda functions.

## Supported Runtimes

- Node.js 18.x
- Node.js 20.x
- Node.js 22.x

## Usage

### In Your Lambda Function

```javascript
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

exports.handler = async (event) => {
  const pool = await sql.connect(config);
  const result = await pool.request().query('SELECT * FROM Products');
  return { statusCode: 200, body: JSON.stringify(result.recordset) };
};
```

### Attach Layer to Lambda

```bash
aws lambda update-function-configuration \
  --function-name my-function \
  --layers arn:aws:lambda:us-east-2:919311966619:layer:nodejs-mssql-layer:1
```

## Local Development

### Build Layer Locally

```bash
# Build for Node.js 22 (default)
./build.sh

# Build for specific version
./build.sh 20
```

### Run Tests

```bash
# Start SQL Server container
docker run -e 'ACCEPT_EULA=Y' -e 'MSSQL_SA_PASSWORD=TestPassword123!' \
  -p 1433:1433 -d mcr.microsoft.com/mssql/server:2022-latest

# Run connection test
DB_SERVER=localhost DB_USER=sa DB_PWD=TestPassword123! DB_NAME=master \
  node test/connection-test.js
```

## CI/CD

The GitHub Actions workflow automatically:

1. Builds layers for Node.js 18, 20, and 22
2. Tests each layer against SQL Server in CI
3. Publishes to Legacy and Production AWS accounts

## Package Versions

| Package | Version |
|---------|---------|
| mssql   | ^11.0.1 |
