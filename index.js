const { Routes } = require("discord-api-types/v9");
const { clientId, guildId, token } = require("./config.json");
const { REST } = require("@discordjs/rest");
const { Client, Intents, Collection } = require("discord.js");
const { Permissions } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async (interaction) => {
  const command = client.commands.get(interaction.commandName);
  if (interaction.isSelectMenu()) {
    const userwarnsEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle(`User ${interaction.values}ed`)
      .setAuthor({
        name: `The user was ${interaction.values}ed`,
        //   iconURL: "https://i.imgur.com/AfFp7pu.png",
        //   url: "https://discord.js.org",
      })
      .setDescription(
        "This is directed towards admins there are options to mute kick and ban users if this is visible to everyone be careful"
      )
      // .setThumbnail("https://i.imgur.com/AfFp7pu.png")
      .setTimestamp()
      .setFooter({
        text: `The user was ${interaction.values}ed`,
      });

    // await interaction.channel.send({ ephemeral: true, embeds: [exampleEmbed], components: [row] });

    // await interaction.reply({content: `You chose ${interaction.values}`})
    await interaction.update({
      content: `The user was ${interaction.values}ed`,
      embeds: [userwarnsEmbed],
      components: [],
    });

    // const { MongoClient } = require("mongodb");
    // const { uri } = require("./config.json");
    // const client = new MongoClient(uri);

    // console.log(interaction)

    // switch (interaction.values) {
    //     case 'Ignore':
    //         await updateListingByName(client, `${interaction}`, {
    //             warns: 0,
    //           });
    //     case 'Kick':

    //     case 'Mute':

    //     case 'Ban':

    // }
  }

  if (!command) return;

  // console.log(interaction.author.user);

  // if (interaction.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) {
  //     console.log('This member can kick');
  // }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

const commands = [];

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(clientId, guildId),
      { body: commands },
      commands.forEach((command) => {
        console.log(`Loaded the "${command.name}" command`);
      }),
      console.log("Successfully reloaded application (/) commands."),
      console.log(
        "If commands aren't loading properly wait a second it's discord's fault"
      )
    );
  } catch (e) {
    console.error(e);
  }
})();
const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(token);
