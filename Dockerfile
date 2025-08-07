FROM node:20-bookworm

# System deps for media processing and yt-dlp
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3-pip \
  && rm -rf /var/lib/apt/lists/*

# yt-dlp via pip (more reliable than runtime download)
RUN pip3 install --no-cache-dir yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm","start"]
