# Stage 1: Build the Vite project
FROM node:alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the built files with Jetty
FROM jetty:9.4-jre8-alpine

# Create a directory for the webapp
RUN mkdir -p /var/lib/jetty/webapps/header

# Copy the built files from the previous stage
COPY --from=build /usr/src/app/dist /var/lib/jetty/webapps/header

# Expose the port Jetty will serve on
EXPOSE 8080

# Start Jetty
CMD ["java", "-jar", "/usr/local/jetty/start.jar"]