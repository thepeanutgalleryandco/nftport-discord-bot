# nftport-discord-bot
Discord bot for NFTPort to fetch Rarity information and Sales Stats

# Steps for usage

## Setup Discord Bot Permissions
- Add a new bot to your discord developer account
- Add all Privileged Gateway Intents under "Bot"
- Go to OAuth 2 -> URL Generator and click on "Bot" under Scopes, choose "Read Messages / View Channels" and "Send Messages" under Bot Permissions
- Share the URL to discord owners to be able to connect to the bot

## Download repo and run npm install

## Configure .env file
Copy env_example to .env and fill in the fields

- BOT_TOKEN: Discord bot token
- NFTPORT_APIKEY: NFTPort APIKey to be used for the Bot
- VERSION: Version of the bot

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
docker run --name nftport-discord-redis -v /Users/roebou/Documents/GitHub/nftport-discord-bot:/data -p 6400:6379 --network nftport-discord-network -d redis
docker run --name nftport-discord-bot --network nftport-discord-network -d thepeanutgalleryandco/nftport-discord-bot:[tag_number]