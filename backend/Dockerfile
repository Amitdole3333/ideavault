# IdeaVault Backend — production Docker image
# Use Debian slim (not Alpine): Prisma's engine needs libssl compatible with glibc; Alpine/musl + OpenSSL 3 causes "libssl.so.1.1: No such file".
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (devDependencies needed for tsc and prisma CLI)
RUN npm ci || npm install

# Copy source and build (tsc + prisma generate)
COPY . .
RUN npm run build

# Remove devDependencies to keep image smaller
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3001

# Start server. Run `npx prisma db push` or migrations separately (e.g. release command) if using a new DB.
CMD ["node", "dist/index.js"]
