FROM node:22-slim

ENV RUNNING_IN_DOCKER=true
ENV DISPLAY=:99

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    firefox-esr \
    chromium \
    chromium-driver \
    unzip \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

RUN GECKO_VERSION=$(wget -qO- https://api.github.com/repos/mozilla/geckodriver/releases/latest | grep tag_name | cut -d '"' -f 4) \
    && wget https://github.com/mozilla/geckodriver/releases/download/$GECKO_VERSION/geckodriver-$GECKO_VERSION-linux64.tar.gz \
    && tar -xzf geckodriver-$GECKO_VERSION-linux64.tar.gz \
    && mv geckodriver /usr/local/bin \
    && chmod +x /usr/local/bin/geckodriver \
    && rm geckodriver-$GECKO_VERSION-linux64.tar.gz

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD Xvfb :99 -screen 0 1920x1080x24 & npm run test
