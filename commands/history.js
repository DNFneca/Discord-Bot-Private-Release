const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const { uri } = require("../config.json");
const { mongoose } = require("mongoose");
const { MongoClient } = require("mongodb");
const { Permissions } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Replies with asdasdasd!")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("user")
        .setDescription("user")
        .addMentionableOption((option) =>
          option
            .setName("mentionable")
            .setDescription("Mention something")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("server").setDescription("Server")
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(
        Permissions.FLAGS.ADMINISTRATOR ||
        Permissions.FLAGS.KICK_MEMBERS ||
        Permissions.FLAGS.BAN_MEMBERS
      )
    )
      return interaction.reply({
        content: `You don't have the permission to warn`,
        ephemeral: true,
      });

    const mentionable = interaction.options.getMentionable("mentionable");

    if (interaction.options.getSubcommand() === "user") {
      if (mentionable.user.bot == true) {
        await interaction.reply({
          content: "You can't mention a bot",
          ephemeral: true,
        });
      } else {
        // await interaction.reply({
        //   content: `${mentionable.user}`,
        // });
        const client = new MongoClient(uri);
        try {
          await client.connect();

          await findUserByName(client, `${mentionable.user.id}`);
          // Update the Infinite Views listing to have 6 bedrooms and 8 beds
        } finally {
          // Close the connection to the MongoDB cluster
          await client.close();
        }
      }
    } else if (interaction.options.getSubcommand() === "server") {
      await interaction.reply("server");
    }

    async function findUserByName(client, nameOfListing) {
      // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne for the findOne() docs
      const result = await client
        .db(`${interaction.guild.id}`)
        .collection("Warnings")
        .findOne({ id: nameOfListing });

      // await updateListingByName(client, `${mentionable.user.id}`, { warns: 3 });

      if (result) {
        console.log(
          `Found a listing in the db with the name '${nameOfListing}':`
        );
        console.log(result);
        switch (result.warns) {
          case 0:
            await interaction.reply({
              content: `${mentionable.user} has been warned, this is his 2nd warning`,
            });
            break;
          case 1:
            await interaction.reply({
              content: `${mentionable.user} has been warned, this is his 3rd warning and final warning`,
            });
            break;
          case 3:
            await interaction.reply({
              content: `${mentionable.user} has been warned 5 times, setting it back to his first warning!`,
            });
        }
      }
    }
  },
};
