# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Make sure images directory exists in public
RUN mkdir -p public/images
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy the built files
COPY --from=build /app/dist /usr/share/nginx/html
# Copy the public images to the correct location
COPY --from=build /app/public/images /usr/share/nginx/html/images
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]