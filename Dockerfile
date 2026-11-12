FROM node:24-trixie AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY web/package.json ./web/package.json
COPY tools/data-mock/package.json ./tools/data-mock/package.json
RUN HUSKY=0 npm ci
COPY web ./web
COPY tools/data-mock ./tools/data-mock

FROM dependencies AS frontend
EXPOSE 5173
CMD ["npm", "run", "dev", "-w", "web"]

FROM dependencies AS data-mock
EXPOSE 8000
CMD ["npm", "run", "start", "-w", "data-mock"]
