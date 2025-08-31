# Node.js Dockerfile for discord-bot-replier
# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY bot.js ./
COPY .env ./
COPY images ./images

# Expose no ports (Discord bots do not require incoming ports)

# Start the bot
CMD ["node", "bot.js"]
