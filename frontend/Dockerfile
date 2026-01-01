FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 3000

# Start the dev server and bind to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]