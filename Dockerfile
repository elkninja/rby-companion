# == Stage 1: Build the React Application ==
FROM node:20-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN npm run build

# == Stage 2: Serve the Application using Nginx ==
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to the outside
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
