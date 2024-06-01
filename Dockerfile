# Use the official Node.js 16 image as a parent image
FROM node:16

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of application's code
COPY . .


# Expose the port the app runs on
EXPOSE 3000


CMD ["npm", "start"]