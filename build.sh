#!/bin/bash
set -euo pipefail

# Default Node.js version
NODE_VERSION="${1:-22}"
LAYER_NAME="nodejs-mssql-layer"
OUTPUT_DIR="dist"

echo "Building Lambda layer for Node.js ${NODE_VERSION}..."

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Build the Docker image
docker build \
    --platform linux/amd64 \
    --build-arg NODE_VERSION="${NODE_VERSION}" \
    -t "${LAYER_NAME}:node${NODE_VERSION}" \
    .

# Create a container and extract the layer
CONTAINER_ID=$(docker create "${LAYER_NAME}:node${NODE_VERSION}")
docker cp "${CONTAINER_ID}:/opt/nodejs" "${OUTPUT_DIR}/nodejs"
docker rm "${CONTAINER_ID}"

# Create the zip file
cd "${OUTPUT_DIR}"
ZIP_NAME="${LAYER_NAME}-node${NODE_VERSION}.zip"
rm -f "${ZIP_NAME}"
zip -r "${ZIP_NAME}" nodejs
rm -rf nodejs

echo "Layer created: ${OUTPUT_DIR}/${ZIP_NAME}"
echo ""
echo "To publish to AWS:"
echo "  aws lambda publish-layer-version \\"
echo "    --layer-name ${LAYER_NAME} \\"
echo "    --description 'Node.js ${NODE_VERSION} mssql layer' \\"
echo "    --compatible-runtimes nodejs${NODE_VERSION}.x \\"
echo "    --zip-file fileb://${OUTPUT_DIR}/${ZIP_NAME}"
