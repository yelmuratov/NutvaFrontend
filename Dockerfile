# 1. Build Stage: Install dependencies and build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies early for better caching
COPY package.json package-lock.json* ./
RUN npm install --frozen-lockfile

# Copy the rest of your app
COPY . .

# Pass build-time environment variable for public envs
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# (Optionally add other build-time envs as needed)
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Build the Next.js app
RUN npm run build

# 2. Production Stage: Start server using built app
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only the built output and necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Copy any other required static files
COPY --from=builder /app/next.config.* ./   
COPY --from=builder /app/.env.production ./

# Set envs again for runtime
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXTAUTH_URL=$NEXTAUTH_URL
ENV NEXTAUTH_SECRET=$NEXTAUTH_SECRET

EXPOSE 3000

CMD ["npm", "run", "start"]
