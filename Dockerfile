# Stage 1: Build the project
FROM node:23-alpine AS builder
WORKDIR /app
# Install pnpm globally
RUN npm install -g pnpm
# Copy package files and install dependencies
COPY package*.json ./
RUN pnpm install
# Copy remaining files and build the project
COPY . .
RUN pnpm run build

# Stage 2: Create the production image
FROM node:23-alpine
WORKDIR /app
# Install pnpm globally in production image
RUN npm install -g pnpm
# Copy package files for production install
COPY --from=builder /app/package*.json ./
# Install only production dependencies using pnpm
RUN pnpm install --prod
# Copy the built files from the builder stage
COPY --from=builder /app/build ./build
CMD ["node", "build/index.js"]