# Use official Node.js LTS image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application files
COPY recaptcha-express-backend.js .
COPY index.html .

# Copy public directory if it has static assets
COPY public ./public 2>/dev/null || true

# Expose the application port
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
