# nftport-discord-bot
Discord bot for NFTPort to Add a contract for monitoring, removing a contract if needed, viewing a contract, fetching rarity information and fetching sales stats.

# Steps for usage

## Setup Discord Bot Permissions
- Add a new bot to your discord developer account by going to https://discord.com/developers/applications and adding a new application
- Add image and description under "General Information"
- Add all Privileged Gateway Intents under "Bot"
- Reset token to get a bot token under "Bot"
- Add an image for your bot under "Bot"
- Go to OAuth 2 -> URL Generator and click on "Bot" under Scopes, choose "Read Messages / View Channels", "Send Messages" and "Use Slash Commands" under Bot Permissions. Copy the "Generated URL".
- Share the "Generated URL" to discord server owners to be able to connect to the bot

## Bot Commands And Usage
- /addcontract [chain] [contractAddress]: Add a new contract to the server (Server owner only command)
- /removecontract : Remove a contract from the server (Server owner only command)
- /viewcontracts : View contract configured for the server (Public command)
- /rarity [token] : View rarity of a specific token for the configured contract (Public command)
- /salesstats : View sales stats for the configured contract (Public command)

## Download repo and run npm install

## Configure .env file
Copy env_example to .env and fill in the fields

- APP_VERSION: Version of the bot
- BOT_TOKEN: Discord bot token
- NFTPORT_KEY: NFTPort APIKey to be used for the Bot
- NODE_ENV: The environment of the bot
- REDIS_HOST: Redis hostname / IP
- REDIS_PASSWORD: Redis user password
- REDIS_PORT: Redis host port
- REDIS_USERNAME: Redis username

### Example
APP_VERSION=1.3.3
BOT_TOKEN=MAasldmasdlm21em.1i2en1.2312i3-123i123n1i-123-3123i_123k123m1k3
NFTPORT_KEY=123456789-1234-1234-1234-1234124i14im1i3
NODE_ENV=production
REDIS_HOST=localhost
REDIS_PASSWORD=redispassword
REDIS_PORT=6379
REDIS_USERNAME=redisusername

## Run bot
- Development - npm run dev
- Production - npm run

# Docker

## Build
docker-compose build

## Create network
docker network create nftport-discord-network

## Push
docker push thepeanutgalleryandco/nftport-discord-bot:[tag_number]

## Pull
docker pull thepeanutgalleryandco/nftport-discord-bot:[tag_number]

## Running container
docker run --name nftport-discord-redis -v [HOST_DIRECTORY]:/data -p 6400:6379 --network nftport-discord-network -d redis
docker run --name nftport-discord-bot --network nftport-discord-network -d thepeanutgalleryandco/nftport-discord-bot:[tag_number]