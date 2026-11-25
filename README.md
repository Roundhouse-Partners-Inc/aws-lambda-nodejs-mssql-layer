# AWS Lambda Node.js MSSQL Layer

AWS Lambda Layer providing [mssql](https://www.npmjs.com/package/mssql) for SQL Server connectivity in Node.js Lambda functions.

## Supported Runtimes

- Node.js 20.x
- Node.js 22.x
- Node.js 24.x

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
  --layers "arn:aws:lambda:us-east-1:344349181969:layer:nodejs-mssql-layer:${LAYER_VERSION}"
```

Set `LAYER_VERSION` to the published layer version for your runtime from the
release you intend to use. AWS layer version numbers differ from repository
release tags.

## Local Development

### Build Layer Locally

```bash
# Build for Node.js 22 (default)
./build.sh

# Build for specific version
./build.sh 20
```

### Run Tests

The connection test needs a running SQL Server. Run it on the XPS or in CI --
never start Docker (or a SQL Server container) on the Mac.

- **Preferred:** open a PR against `main`. The `test` job in
  `.github/workflows/build-and-release.yml` runs `test/connection-test.js`
  against a SQL Server service container for every runtime in `versions.json`.
  The `Layer checks passed` job passes only when every build and test passed;
  it is the status check `main` requires before a PR can merge.
- **Interactive:** use the XPS test copy for this repo (see
  Roundhouse-Infrastructure `docs/xps-github-runners.md`) and run the test
  there against its SQL Server:

```bash
# On the XPS, not the Mac
DB_SERVER=127.0.0.1 DB_USER=sa DB_PWD='<sa password>' DB_NAME=master \
  node test/connection-test.js
```

## CI/CD

The GitHub Actions workflow automatically:

1. Builds layers for the runtimes in `versions.json` (20, 22, and 24), on every
   PR to `main` and on pushes to `main`
2. Tests each layer against SQL Server in CI
3. Publishes to Production AWS account (344349181969) on version tags

### Enable automated update pull requests

In repository **Settings > Actions > General > Workflow permissions**, enable
**Allow GitHub Actions to create and approve pull requests**. If the setting is
locked, an organization administrator must enable it in the organization Actions
policy first. The workflow already requests `contents: write` and
`pull-requests: write`; those token scopes do not override this policy.

After enabling the setting, run **Check for Runtime Updates** manually and verify
that it creates an update PR when changes are available. Builds and SQL Server
tests run on that PR like any other, and Dependabot auto-merge waits for them.

## Package Versions

| Package | Version |
|---------|---------|
| mssql   | ^12.5.0 |
