ARG NODE_VERSION=22
FROM public.ecr.aws/lambda/nodejs:${NODE_VERSION} AS builder

# Install build tools needed for native modules
RUN dnf install -y gcc gcc-c++ make python3

# Create layer directory structure
WORKDIR /opt/nodejs

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --production

# Final stage - just copy the node_modules
FROM public.ecr.aws/lambda/nodejs:${NODE_VERSION}

WORKDIR /opt

# Copy built node_modules
COPY --from=builder /opt/nodejs /opt/nodejs

# The layer will be extracted from /opt
CMD ["echo", "Layer built successfully"]
