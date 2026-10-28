FROM node:26-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit dev

COPY . .

ENV PORT=3000
ENV NODE_ENV=production

EXPOSE ${PORT}

USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:${PORT}/health').then(r=>r.json()).then(b=>process.exit(b.status==='ok'?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["node"]
CMD ["app.js"]
