FROM node:14.11-alpine
ARG BUILDTYPE

ENV NODE_ENV ${BUILDTYPE}
ENV PUBLIC_DIR "/app/dist/public"

WORKDIR /app
COPY ./backend/package.json ./backend/package-lock.json ./
RUN npm install --also=dev

COPY ./backend/ ./
RUN npm run build

CMD ["npm", "run", "serve"]