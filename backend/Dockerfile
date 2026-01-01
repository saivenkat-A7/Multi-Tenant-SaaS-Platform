# Use Node 20 Alpine
FROM node:20-alpine

# Install required dependencies for Prisma & OpenSSL
RUN apk add --no-cache openssl bash curl git

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install node modules
RUN npm install

# Copy the rest of the backend code
COPY . .

# Generate Prisma client for linux-musl
RUN npx prisma generate

# Expose backend port
EXPOSE 5000

# Start the backend
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]