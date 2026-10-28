FROM node:26-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit dev

COPY . .

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE ${PORT}

USER node
ENTRYPOINT ["node"]

CMD ["app.js"]
