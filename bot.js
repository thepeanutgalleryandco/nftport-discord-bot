require('dotenv').config();
require('console-stamp')(console, {
  format: ':label :date(yyyy/mm/dd HH:MM:ss.l,true)',
});

const { getCache, setCache } = require('./modules/redisCache');
const eris = require('eris');
const fetch = require('node-fetch');
const Eris = require('eris');

const bot = new eris.Client(process.env.BOT_TOKEN);
const commandHandlerForCommandName = {
  DM: {},
  Channel: {},
};

// BotOwnerOnly Functions
// Function for adding a contract and chain for a specific server when /addcontract is used
commandHandlerForCommandName.Channel.addcontract = {
  botOwnerOnly: true,
  execute: async (_interaction, _args) => {
    const contractChain = _args[0].value.toLowerCase();
    const contractAddress = _args[1].value;
    let monitoredContracts = JSON.parse(
      await getCache(_interaction.channel.guild.id)
    );
    const url =
      contractChain === 'ethereum' || contractChain === 'polygon'
        ? `https://api.nftport.xyz/v0/nfts/${contractAddress}?chain=${contractChain}&page_number=1&page_size=50&include=rarity&refresh_metadata=false`
        : `https://api.nftport.xyz/v0/solana/nfts/${contractAddress}`;
    console.log(
      `ServerID: ${_interaction.channel.guild.id} ChannelID:${_interaction.channel.id} Fetching contract ${contractAddress} on ${contractChain} chain`
    );

    // Check if contract and address combination can be found in the server's list of contracts
    if (monitoredContracts !== null && monitoredContracts.length > 0) {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'contract_already_available',
          message: 'Contract already available.',
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

// Function for removing a contract and chain for a specific server when /removecontract is used
commandHandlerForCommandName.Channel.removecontract = {
  botOwnerOnly: true,
  execute: async (_interaction, _args) => {
    let monitoredContracts = JSON.parse(
      await getCache(_interaction.channel.guild.id)
    );

    console.log(
      `ServerID: ${_interaction.channel.guild.id} ChannelID:${_interaction.channel.id}  Removing contract.`
    );

    // Check if contract and address combination can be found in the server's list of contracts
    if (monitoredContracts === null || monitoredContracts.length === 0) {
      return _interaction.createMessage('No contract configured yet.');
    }

    monitoredContracts = monitoredContracts.filter(
      (elem) =>
        !(
          elem.contractAddress === monitoredContracts[0].contractAddress &&
          elem.contractChain === monitoredContracts[0].contractChain
        )
    );

    await setCache(_interaction.channel.guild.id, monitoredContracts);

    return _interaction.createMessage('Successfully removed contract.');
  },
};

// Function for viewing available contracts and chains for a specific server when /viewcontracts is used
commandHandlerForCommandName.Channel.viewcontracts = {
  botOwnerOnly: false,
  execute: async (_interaction, _args) => {
    console.log(
      `ServerID: ${_interaction.channel.guild.id} ChannelID:${_interaction.channel.id} Fetching contracts available to ${_interaction.channel.guild.id}`
    );

    const embed = {};
    const fields = [];
    const monitoredContracts = JSON.parse(
      await getCache(_interaction.channel.guild.id)
    );

    // Check if the server can be found in the list and if any contracts have been configured
    if (monitoredContracts !== null && monitoredContracts.length > 0) {
      for (const contract of monitoredContracts) {
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

      return _interaction.createMessage({ embed });
    }
    return _interaction.createMessage('No contract configured yet.');
  },
};

// Function for checking rarity of a token on a contract and chain for a specific server when /rarity is used
commandHandlerForCommandName.Channel.rarity = {
  botOwnerOnly: false,
  execute: async (_interaction, _args) => {
    const tokenID = _args[0].value;
    const monitoredContracts = JSON.parse(
      await getCache(_interaction.channel.guild.id)
    );

    console.log(
      `ServerID: ${_interaction.channel.guild.id} ChannelID:${_interaction.channel.id}  Fetching rarity for tokenID ${tokenID}`
    );

    // Check if contract and address combination can be found in the server's list of contracts
    if (monitoredContracts === null || monitoredContracts.length === 0) {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'contract_not_available',
          message: 'Contract not available.',
        },
      };
    }

    // Check if chain supports rarity
    if (monitoredContracts[0].contractChain !== 'ethereum') {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'chain_not_currently_supported',
          message: 'Chain does not support rarity yet.',
        },
      };
    }

    return fetch(
      `https://api.nftport.xyz/v0/nfts/${monitoredContracts[0].contractAddress}/${tokenID}?chain=${monitoredContracts[0].contractChain}&refresh_metadata=false&include=rarity`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.NFTPORT_KEY,
        },
      }
    )
      .then(async (res) => res.json())
      .catch(async (error) => error);
  },
};

// Function for checking sales stats of a contract and chain for a specific server when /salesstats is used
commandHandlerForCommandName.Channel.salesstats = {
  botOwnerOnly: false,
  execute: async (_interaction, _args) => {
    const monitoredContracts = JSON.parse(
      await getCache(_interaction.channel.guild.id)
    );

    console.log(
      `ServerID: ${_interaction.channel.guild.id} ChannelID:${_interaction.channel.id}  Fetching sales stats.`
    );

    // Check if contract and address combination can be found in the server's list of contracts
    if (monitoredContracts === null || monitoredContracts.length === 0) {
      return {
        response: 'NOK',
        error: {
          status_code: -1,
          code: 'contract_not_available',
          message: 'Contract not available.',
        },
      };
    }

    const url =
      monitoredContracts[0].contractChain === 'ethereum' ||
      monitoredContracts[0].contractChain === 'polygon'
        ? `https://api.nftport.xyz/v0/transactions/stats/${monitoredContracts[0].contractAddress}?chain=${monitoredContracts[0].contractChain}`
        : `https://api.nftport.xyz/v0/solana/transactions/stats/${monitoredContracts[0].contractAddress}`;

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
  try {
    await bot.createCommand(
      {
        name: 'addcontract',
        description: 'Add Contract',
        options: [
          {
            type: 3,
            name: 'chain',
            description: 'Chain for the contract address',
            required: true,
            choices: [
              {
                name: 'Ethereum',
                description: 'The Ethereum Chain',
                value: 'ethereum',
              },
              {
                name: 'Polygon',
                description: 'The Polygon Chain',
                value: 'polygon',
              },
              {
                name: 'Solana',
                description: 'The Solana Chain',
                value: 'solana',
              },
            ],
          },
          {
            type: 3,
            name: 'contractaddress',
            description: 'The contract address to be added',
            required: true,
            min_length: 1,
            max_length: 100,
          },
        ],
      },
      1
    );

    await bot.createCommand(
      {
        name: 'removecontract',
        description: 'Remove Contract',
      },
      1
    );

    await bot.createCommand(
      { name: 'viewcontracts', description: 'View monitored contracts' },
      1
    );

    await bot.createCommand(
      {
        name: 'rarity',
        description: 'Rarity of NFT / Token',
        options: [
          {
            type: 3,
            name: 'tokenid',
            description: 'The tokenID to fetch the rarity information for',
            required: true,
            min_length: 1,
            max_length: 1000,
          },
        ],
      },
      1
    );

    await bot.createCommand(
      {
        name: 'salesstats',
        description: 'Sales stats',
      },
      1
    );
  } catch (error) {
    console.log(error);
  }

  console.log('Bot is online and ready for action!');
});

// Function to handle slash commands being sent
bot.on('interactionCreate', async (interaction) => {
  if (interaction instanceof Eris.CommandInteraction) {
    await interaction.defer();

    // Check if message is coming in DM or Server Channel
    const messageType = !interaction.channel.guild ? 'DM' : 'Channel';

    if (messageType === 'DM') {
      return interaction.createMessage(
        'Bot can only be used from within a server channel'
      );
    }

    const commandName = interaction.data.name;

    // Check to see if the command exists for the specific message type
    const commandHandler =
      commandHandlerForCommandName[messageType][commandName];
    const authorIsBotOwner =
      interaction.member.user.id === interaction.channel.guild.ownerID;

    // Only allow guild owner to perform admin functions
    /*if (commandHandler.botOwnerOnly && !authorIsBotOwner) {
        return interaction.createMessage('You must be the owner of this server to run this command');
      }*/

    // Separate the command arguments from the command prefix and command name.
    const args = interaction.data.options;
    let commandResponse = {};

    try {
      // Execute the command.
      commandResponse = await commandHandler.execute(interaction, args);

      // Check response from NFTPort for adding a contract
      if (
        commandName === 'addcontract' ||
        commandName === 'rarity' ||
        commandName === 'salesstats'
      ) {
        if (commandResponse.response === 'OK') {
          if (commandName === 'addcontract') {
            const monitoredContracts = JSON.parse(
              await getCache(interaction.channel.guild.id)
            );

            /*
              Check if server / guildID exists
              If not, add a new key and array value with the contract object
              If it exists, check if the contract object already exists
              If it does not exist, then add it to the array, otherwise skip over it as it already exists
            */
            if (monitoredContracts === null) {
              await setCache(interaction.channel.guild.id, [
                {
                  contractAddress: args[1].value,
                  contractChain: args[0].value,
                  contractName:
                    args[0].value.toLowerCase() === 'ethereum' ||
                    args[0].value.toLowerCase() === 'polygon'
                      ? commandResponse.contract.name
                      : commandResponse.nfts[0].metadata.collection.name,
                },
              ]);
            } else {
              const monitoredContractCount = JSON.parse(
                await getCache(interaction.channel.guild.id)
              ).filter(
                (elem) =>
                  elem.contractAddress === args[1].value &&
                  elem.contractChain === args[0].value
              ).length;

              if (monitoredContractCount === 0) {
                monitoredContracts.push({
                  contractAddress: args[1].value,
                  contractChain: args[0].value,
                  contractName:
                    args[0].value.toLowerCase() === 'ethereum' ||
                    args[0].value.toLowerCase() === 'polygon'
                      ? commandResponse.contract.name
                      : commandResponse.nfts[0].metadata.collection.name,
                });
                await setCache(
                  interaction.channel.guild.id,
                  monitoredContracts
                );
              }
            }

            return interaction.createMessage(
              `Successfully added ${
                args[0].value.toLowerCase() === 'ethereum' ||
                args[0].value.toLowerCase() === 'polygon'
                  ? commandResponse.contract.name
                  : commandResponse.nfts[0].metadata.collection.name
              } to monitored contracts`
            );
          }
          if (commandName === 'rarity') {
            // Check if rarity information is available
            if (commandResponse.nft.rarity === null) {
              return interaction.createMessage(
                'Rarity information is not available for this chain, contract address and tokenID combination. Please contract NFTPort team to add rarity information for this contract.'
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
              commandResponse.contract.metadata.cached_thumbnail_url !==
              undefined
            ) {
              embed.author = {
                name: commandResponse.contract.name,
                icon_url:
                  commandResponse.contract.metadata.cached_thumbnail_url,
              };
            }

            return interaction.createMessage({
              embed,
            });
          }
          if (commandName === 'salesstats') {
            const fields = [];

            Object.entries(commandResponse.statistics).forEach((statistic) => {
              fields.push({
                name: String(statistic[0]),
                value: String(statistic[1] === null ? 'N/A' : statistic[1]),
                inline: true,
              });
            });

            return interaction.createMessage({
              embed: {
                title: 'Sales Stats',
                fields,
              },
            });
          }
        } else if (commandResponse.error.code === 'invalid_api_key') {
          return interaction.createMessage('Invalid NFTPort APIKey');
        } else if (commandResponse.error.code === 'invalid_enumeration') {
          return interaction.createMessage('Invalid NFTPort Supported Chain');
        } else if (commandResponse.error.code === 'invalid_address') {
          return interaction.createMessage('Invalid Contract Address');
        } else if (commandResponse.error.code === 'not_found') {
          if (commandName === 'addcontract') {
            return interaction.createMessage(
              'Contract Address Does Not Exist On Selected Chain'
            );
          } else if (commandName === 'rarity') {
            return interaction.createMessage('TokenID Does Not Exist');
          } else if (commandName === 'salesstats') {
            return interaction.createMessage(
              `Sales stats can't be found for contract and chain combination. Please contact NFTPort support.`
            );
          }
        } else if (commandResponse.error.code === 'contract_not_available') {
          return interaction.createMessage('No contract configured yet.');
        } else if (
          commandResponse.error.code === 'chain_not_currently_supported'
        ) {
          return interaction.createMessage(
            'Rarity is not yet supported for the selected chain'
          );
        } else if (
          commandResponse.error.code === 'contract_already_available'
        ) {
          return interaction.createMessage(
            'Already monitoring a contract. First remove the current contract and then add a new one.'
          );
        } else {
          console.log(`Other error - ${JSON.stringify(commandResponse)}`);
          return interaction.createMessage(
            'Something went wrong, please contact NFT Support team to investigate.'
          );
        }
      }
    } catch (error) {
      console.log('Error handling command');
      console.log(error);
    }
  }
});

bot.on('guildCreate', async (guild) => {
  console.log(guild);
});

bot.on('error', (err) => {
  console.log(err);
});

bot.connect();
