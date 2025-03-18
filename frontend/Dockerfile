FROM node:18-alpine as build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set production environment and build
ENV NODE_ENV=production
ENV REACT_APP_API_URL=https://lifeplace-backend.fly.dev/api
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration (optional, create this file if you need custom configs)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Add script to replace environment variables at runtime (allows for dynamic configuration)
RUN apk add --no-cache bash
COPY --from=build /app/build /usr/share/nginx/html

# Create script to replace environment variables in the built JS files
RUN echo '#!/bin/bash\n\
    # Replace environment variables in JS files\n\
    find /usr/share/nginx/html -name "*.js" -exec sed -i -e "s|REACT_APP_API_URL_PLACEHOLDER|$REACT_APP_API_URL|g" {} \;\n\
    # Start nginx\n\
    nginx -g "daemon off;"' > /start.sh && chmod +x /start.sh

# Run the script to replace environment variables and start nginx
CMD ["/start.sh"]