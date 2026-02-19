# IdeaVault Backend — production Docker image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies (including Prisma for generate)
RUN npm ci --omit=dev || npm install --omit=dev

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

# Start server. Run `npx prisma db push` or migrations separately (e.g. release command) if using a new DB.
CMD ["node", "dist/index.js"]
