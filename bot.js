require('dotenv').config();
require('console-stamp')(console, {
  format: ':label :date(yyyy/mm/dd HH:MM:ss.l,true)',
});

const eris = require('eris');
const fetch = require('node-fetch');

const PREFIX = '!';
const bot = new eris.Client(process.env.BOT_TOKEN);
const commandHandlerForCommandName = {
  DM: {},
  Channel: {},
};
const userData = [];

// Function return message to Discord
function returnMessage(_messageType, _channel, _message) {
  console.log(`${_channel}: ${_message}`);

  // Message in DM
  if (_messageType === 'DM') {
    return bot.createMessage(_channel, _message);
  } // Message in channel
  if (_messageType === 'Channel') {
    return _channel.createMessage(_message);
  }
}

// BotOwnerOnly Functions
// Function for adding a contract and chain for a specific server when !addContract is used
commandHandlerForCommandName.Channel.addcontract = {
  botOwnerOnly: true,
  execute: (_msg, _messageType, _args) => {
    const contractChain = _args[0].toLocaleLowerCase();
    const contractAddress = _args[1];
    const url = contractChain === 'ethereum' || contractChain === 'polygon'
      ? `https://api.nftport.xyz/v0/nfts/${contractAddress}?chain=${contractChain}&page_number=1&page_size=50&include=rarity&refresh_metadata=false`
      : `https://api.nftport.xyz/v0/solana/nfts/${contractAddress}`;

    console.log(
      `ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id} Fetching contract ${contractAddress} on ${contractChain} chain`,
    );

    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.NFTPORT_KEY,
      },
    })
      .then(async (res) => res.json())
      .catch(async (error) => error);
  },
};

// Function for removing a contract and chain for a specific server when !removeContract is used
commandHandlerForCommandName.Channel.removecontract = {
  botOwnerOnly: true,
  execute: (_msg, _messageType, _args) => {
    const contractChain = _args[0].toLowerCase();
    const contractAddress = _args[1];

    console.log(
      `ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id}  Removing contract ${contractAddress} on ${contractChain} chain`,
    );

    // Check if contract and address combination can be found in the server's list of contracts
    if (
      userData[_msg.channel.guild.id] === undefined
      || userData[_msg.channel.guild.id].filter((elem) => (
        elem.contractAddress === contractAddress
          && elem.contractChain === contractChain
      )).length === 0
    ) {
      return returnMessage(
        _messageType,
        _msg.channel,
        'Contract not found. Please use !help to see command to view all contracts available.',
      );
    }
    userData[_msg.channel.guild.id] = userData[_msg.channel.guild.id].filter(
      (elem) => !(
        elem.contractAddress === contractAddress
            && elem.contractChain === contractChain
      ),
    );

    return returnMessage(
      _messageType,
      _msg.channel,
      'Successfully removed contract.',
    );
  },
};

// Public Functions
// Function for getting help for Channel
commandHandlerForCommandName.Channel.help = {
  botOwnerOnly: false,
  execute: (_msg, _messageType, _args) => {
    //if (_msg.channel.guild.ownerID === _msg.author.id) {
      console.log(`ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id} Fetching help menu for owner`);

      returnMessage(_messageType, _msg.channel, {
        embed: {
          title: 'Help Menu',
          fields: [
            {
              name: '!addcontract',
              value:
                '***!addcontract (Contract_Chain) (Contract_Address / Collection_ID)***\n\nUse this command to add a new contract address to your bot to track rarity and sale stats for.\n\nExample:\n!addcontract ethereum 0x41dEFe83C58bD12e83C115CF5fE18b9F2a9871d4',
              inline: false,
            },
            {
              name: '!removecontract',
              value:
                '***!removecontract (Contract_Chain) (Contract_Address)***\n\nUse this command to remove a contract address from your bot to stop tracking rarity and sale stats for.\n\nExample:\n!removecontract ethereum 0x41dEFe83C58bD12e83C115CF5fE18b9F2a9871d4',
              inline: false,
            },
            {
              name: '!viewcontracts',
              value:
                'Use this command to see all of the contracts that are available to check rarity and sales stats against.',
              inline: false,
            },
            {
              name: '!rarity',
              value:
                '***!rarity (Contract_Chain) (Contract_Address) (Token_ID)***\n\nOnly Ethereum supported at this point in time. Use this command to check the rarity of a specific token of a given contract address on a specific chain.\n\nExample:\n!rarity ethereum 0x41dEFe83C58bD12e83C115CF5fE18b9F2a9871d4 1',
              inline: false,
            },
            {
              name: '!salesstats',
              value:
                '***!salesstats (Contract_Chain) (Contract_Address)***\n\nUse this command to check the sales stats of a specific a given contract address on a specific chain.\n\nExample:\n!salesstats ethereum 0x41dEFe83C58bD12e83C115CF5fE18b9F2a9871d4',
              inline: false,
            },
          ],
        },
      });
    /*} else {
      console.log(`ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id}  Fetching help menu for public`);

      returnMessage(_messageType, _msg.channel, {
        embed: {
          title: 'Help Menu',
          fields: [
            {
              name: '!viewcontracts',
              value:
                'Use this command to see all of the contracts that are available to check rarity and sales stats against.',
              inline: false,
            },
            {
              name: '!rarity',
              value:
                '***!rarity (Contract_Chain) (Contract_Address) (Token_ID)***\n\nOnly Ethereum supported at this point in time. Use this command to check the rarity of a specific token of a given contract address on a specific chain.\n\nExample:\n!rarity ethereum 0x41dEFe83C58bD12e83C115CF5fE18b9F2a9871d4 1',
              inline: false,
            },
            {
              name: '!salesstats',
              value:
                '***!salesstats (Contract_Chain) (Contract_Address)***\\nnUse this command to check the sales stats of a specific a given contract address on a specific chain.\n\nExample:\n!salesstats ethereum 0x41dEFe83C58bD12e83C115CF5fE18b9F2a9871d4',
              inline: false,
            },
          ],
        },
      });
    }*/
  },
};

// Function for viewing available contracts and chains for a specific server when !viewContracts is used
commandHandlerForCommandName.Channel.viewcontracts = {
  botOwnerOnly: false,
  execute: (_msg, _messageType, _args) => {
    console.log(
      `ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id} Fetching contracts available to ${_msg.channel.guild.id}`,
    );

    const embed = {};
    const fields = [];

    // Check if the server can be found in the list and if any contracts have been configured
    if (
      userData[_msg.channel.guild.id] !== undefined
      && userData[_msg.channel.guild.id].length > 0
    ) {
      for (const contract of userData[_msg.channel.guild.id]) {
        fields.push({
          name: 'Name',
          value: contract.contractName,
          inline: true,
        });

        fields.push({
          name: 'Address',
          value: contract.contractAddress,
          inline: true,
        });

        fields.push({
          name: 'Chain',
          value: contract.contractChain,
          inline: true,
        });
      }

      embed.title = 'Monitored Contracts';
      embed.fields = fields;

      return returnMessage(_messageType, _msg.channel, { embed });
    }
    return returnMessage(
      _messageType,
      _msg.channel,
      'No contracts configured yet.',
    );
  },
};

// Function for checking rarity of a token on a contract and chain for a specific server when !rarity is used
commandHandlerForCommandName.Channel.rarity = {
  botOwnerOnly: false,
  execute: (_msg, _messageType, _args) => {
    const contractChain = _args[0].toLowerCase();
    const contractAddress = _args[1];
    const tokenID = _args[2];

    console.log(
      `ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id}  Fetching rarity for tokenID ${tokenID} for contract ${contractAddress} on ${contractChain} chain`,
    );

    // Check if chain supports rarity
    if (contractChain !== 'ethereum') {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'chain_not_currently_supported',
          message: 'Chain does not support rarity yet.',
        },
      };
    }

    // Check if contract and address combination can be found in the server's list of contracts
    if (
      userData[_msg.channel.guild.id] === undefined
      || userData[_msg.channel.guild.id].filter((elem) => (
        elem.contractAddress === contractAddress
          && elem.contractChain === contractChain
      )).length === 0
    ) {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'contract_not_available',
          message: 'Contract not available.',
        },
      };
    }

    return fetch(
      `https://api.nftport.xyz/v0/nfts/${contractAddress}/${tokenID}?chain=${contractChain}&refresh_metadata=false&include=rarity`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.NFTPORT_KEY,
        },
      },
    )
      .then(async (res) => res.json())
      .catch(async (error) => error);
  },
};

// Function for checking sales stats of a contract and chain for a specific server when !salesstats is used
commandHandlerForCommandName.Channel.salesstats = {
  botOwnerOnly: false,
  execute: (_msg, _messageType, _args) => {
    const contractChain = _args[0].toLowerCase();
    const contractAddress = _args[1];
    const url = contractChain === 'ethereum' || contractChain === 'polygon'
      ? `https://api.nftport.xyz/v0/transactions/stats/${contractAddress}?chain=${contractChain}`
      : `https://api.nftport.xyz/v0/solana/transactions/stats/${contractAddress}`;

    console.log(
      `ServerID: ${_msg.channel.guild.id} ChannelID:${_msg.channel.id}  Fetching sales stats for for contract ${contractAddress} on ${contractChain} chain`,
    );

    // Check if contract and address combination can be found in the server's list of contracts
    if (
      userData[_msg.channel.guild.id] === undefined
      || userData[_msg.channel.guild.id].filter((elem) => (
        elem.contractAddress === contractAddress
          && elem.contractChain === contractChain
      )).length === 0
    ) {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'contract_not_available',
          message: 'Contract not available.',
        },
      };
    }

    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.NFTPORT_KEY,
      },
    })
      .then(async (res) => res.json())
      .catch(async (error) => error);
  },
};

// Console log to state bot is ready
bot.once('ready', async (msg) => {
  console.log('Bot is online and ready for action!');
});

// Function to handle messages being sent
bot.on('messageCreate', async (msg) => {
  // Do not respond to messages from the bot
  if (msg.author.bot) return;

  const { content } = msg;

  // Check if message is coming in DM or Server Channel
  const messageType = !msg.channel.guild ? 'DM' : 'Channel';

  if (messageType === 'DM') {
    return returnMessage(
      messageType,
      msg.channel.id,
      'Bot can only be used from within a server channel',
    );
  }

  // Ignore any message that doesn't start with the correct prefix.
  if (content.startsWith(PREFIX)) {
    // Extract the parts of the command and the command name
    const parts = content
      .split(' ')
      .map((s) => s.trim())
      .filter((s) => s);
    const commandName = parts[0].substr(PREFIX.length).toLocaleLowerCase();

    // Check to see if the command exists for the specific message type
    const commandHandler = commandHandlerForCommandName[messageType][commandName];
    const authorIsBotOwner = msg.author.id === msg.channel.guild.ownerID;

    // Invalid command used
    if (!commandHandler) {
      if (!msg.channel.guild) {
        return returnMessage(
          messageType,
          msg.channel.id,
          'Command not in list of commands. Please try !help .',
        );
      }
      return returnMessage(
        messageType,
        msg.channel,
        'Command not in list of commands. Please try !help .',
      );
    }

    // Only allow guild owner to perform admin functions
    /*if (commandHandler.botOwnerOnly && !authorIsBotOwner) {
      return returnMessage(
        messageType,
        msg.channel,
        'You must be the owner of this server to run this command',
      );
    }
    */
   
    // Separate the command arguments from the command prefix and command name.
    const args = parts.slice(1);
    let commandResponse = {};

    try {
      // Execute the command.
      commandResponse = await commandHandler.execute(msg, messageType, args);
    } catch (error) {
      console.log('Error handling command');
      console.log(error);
    }

    // Check response from NFTPort for adding a contract
    if (
      commandName === 'addcontract'
      || commandName === 'rarity'
      || commandName === 'salesstats'
    ) {
      if (commandResponse.response === 'OK') {
        if (commandName === 'addcontract') {
          /*
            Check if server / guildID exists
              If not, add a new key and array value with the contract object
              If it exists, check if the contract object already exists
              If it does not exist, then add it to the array, otherwise skip over it as it already exists
          */
          userData[msg.channel.guild.id] === undefined
            ? userData[msg.channel.guild.id] = [
              {
                contractAddress: args[1],
                contractChain: args[0],
                contractName:
                    args[0] === 'ethereum' || args[0] === 'polygon'
                      ? commandResponse.contract.name
                      : commandResponse.nfts[0].metadata.collection.name,
              },
            ]
            : userData[msg.channel.guild.id].filter((elem) => (
              elem.contractAddress === args[1]
                  && elem.contractChain === args[0]
            )).length === 0
              ? userData[msg.channel.guild.id].push({
                contractAddress: args[1],
                contractChain: args[0],
                contractName:
                  args[0] === 'ethereum' || args[0] === 'polygon'
                    ? commandResponse.contract.name
                    : commandResponse.nfts[0].metadata.collection.name,
              })
              : null;

          return returnMessage(
            messageType,
            msg.channel,
            `Successfully added ${
              args[0] === 'ethereum' || args[0] === 'polygon'
                ? commandResponse.contract.name
                : commandResponse.nfts[0].metadata.collection.name
            } to monitored contracts`,
          );
        } if (commandName === 'rarity') {
          // Check if rarity information is available
          if (commandResponse.nft.rarity === null) {
            return returnMessage(
              messageType,
              msg.channel,
              'Rarity information is not available for this chain, contract address and tokenID combination. Please contract NFTPort team to add rarity information for this contract.',
            );
          }
          const fields = [];

          // Add non-inline fields
          fields.push({
            name: 'Owner',
            value: commandResponse.owner,
            inline: false,
          });

          fields.push({
            name: 'Collection Size',
            value: String(commandResponse.nft.rarity.collection_size),
            inline: false,
          });

          fields.push({
            name: 'Rank',
            value: String(commandResponse.nft.rarity.rank),
            inline: false,
          });

          fields.push({
            name: 'Score',
            value: String(commandResponse.nft.rarity.score),
            inline: false,
          });

          fields.push({
            name: 'Last Updated At',
            value: commandResponse.nft.rarity.updated_date,
            inline: false,
          });

          // Add inline attribute fields
          if (commandResponse.nft.metadata.attributes !== undefined) {
            for (const attribute of commandResponse.nft.metadata.attributes) {
              fields.push({
                name: String(attribute.trait_type),
                value: String(attribute.value),
                inline: true,
              });
            }
          }

          // Create core embed message
          const embed = {
            title: `${commandResponse.contract.name} #${commandResponse.nft.token_id}`,
            fields,
          };

          // Add image URL if it exists
          if (commandResponse.nft.cached_file_url !== undefined) {
            embed.image = {
              url: commandResponse.nft.cached_file_url,
            };
          }

          // Add collection URL if it exists
          if (
            commandResponse.contract.metadata.cached_thumbnail_url
              !== undefined
          ) {
            embed.author = {
              name: commandResponse.contract.name,
              icon_url:
                  commandResponse.contract.metadata.cached_thumbnail_url,
            };
          }

          return returnMessage(messageType, msg.channel, {
            embed,
          });
        } if (commandName === 'salesstats') {
          const fields = [];

          Object.entries(commandResponse.statistics).forEach((statistic) => {
            fields.push({
              name: String(statistic[0]),
              value: String(statistic[1] === null ? 'N/A' : statistic[1]),
              inline: true,
            });
          });

          return returnMessage(messageType, msg.channel, {
            embed: {
              title: 'Sales Stats',
              fields,
            },
          });
        }
      } else if (commandResponse.error.code === 'invalid_api_key') {
        return returnMessage(
          messageType,
          msg.channel,
          'Invalid NFTPort APIKey',
        );
      } else if (commandResponse.error.code === 'invalid_enumeration') {
        return returnMessage(
          messageType,
          msg.channel,
          'Invalid NFTPort Supported Chain',
        );
      } else if (commandResponse.error.code === 'invalid_address') {
        return returnMessage(
          messageType,
          msg.channel,
          'Invalid Contract Address',
        );
      } else if (commandResponse.error.code === 'not_found') {
        return returnMessage(
          messageType,
          msg.channel,
          'Contract Address Does Not Exist On Selected Chain',
        );
      } else if (commandResponse.error.code === 'contract_not_available') {
        return returnMessage(
          messageType,
          msg.channel,
          'Contract not found. Please use !help to see command to view all contracts available.',
        );
      } else if (
        commandResponse.error.code === 'chain_not_currently_supported'
      ) {
        return returnMessage(
          messageType,
          msg.channel,
          'Rarity is not yet supported for the selected chain',
        );
      } else {
        console.log(`Other error - ${JSON.stringify(commandResponse)}`);
      }
    }
  }
});

bot.on('error', (err) => {
  console.log(err);
});

bot.connect();
