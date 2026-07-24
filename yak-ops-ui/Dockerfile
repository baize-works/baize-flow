FROM node:20-alpine
WORKDIR /app/seatunnel-ui
COPY ./* ./
RUN yarn install
CMD ["yarn", "start"]
EXPOSE 8000
