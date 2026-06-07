# Express API 서버 컨테이너
FROM node:20-bookworm-slim

WORKDIR /usr/src/app

# better-sqlite3 는 네이티브 빌드가 필요해 build 도구를 설치합니다.
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# DB 파일은 volume(db-data)에 영속화합니다.
ENV DB_PATH=/usr/src/app/data/bookshelf.db
RUN mkdir -p /usr/src/app/data

EXPOSE 3000
CMD ["node", "server.js"]
