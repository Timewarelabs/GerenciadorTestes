FROM node:22-slim

ENV RUNNING_IN_DOCKER=true

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    firefox-esr \
    chromium \
    chromium-driver \
    unzip \
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

CMD ["npm", "run", "test"]
