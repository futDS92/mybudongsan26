FROM node:20-alpine

WORKDIR /app

COPY index.html client.js server.mjs styles.css README.md ./

EXPOSE 4177

ENV HOST=0.0.0.0
ENV PORT=4177

CMD ["node", "server.mjs"]
