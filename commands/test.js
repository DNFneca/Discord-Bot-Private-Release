const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const { uri } = require("../config.json");
const { mongoose } = require("mongoose");
const { MongoClient } = require("mongodb");
const { Permissions } = require("discord.js");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("A test command")
    .addMentionableOption((option) =>
      option
        .setName("mentionable")
        .setDescription("Mention something")
        .setRequired(true)
    ),
  async execute(interaction) {
    console.log(interaction.user.id);
    if (interaction.user.id != "386475166085152769")
      return interaction.reply(`Nahh dawg we ain't like that yet`);
    const string = interaction.options.getString("input");
    const integer = interaction.options.getInteger("int");
    const number = interaction.options.getNumber("num");
    const boolean = interaction.options.getBoolean("choice");
    const user = interaction.options.getUser("target");
    const member = interaction.options.getMember("target");
    const channel = interaction.options.getChannel("destination");
    const role = interaction.options.getRole("muted");
    const mentionable = interaction.options.getMentionable("mentionable");

    if (mentionable.user.bot == true) {
      await interaction.reply({ content: "You can't mention a bot" });
    } else {
      const row = new MessageActionRow().addComponents(
        new MessageSelectMenu()
          .setCustomId("select")
          .setPlaceholder("Nothing selected")
          .setMaxValues(1)
          .addOptions([
            {
              label: "Mute",
              description: "This is a description",
              value: "Mute",
            },
            {
              label: "Kick",
              description: "This is also a description",
              value: "Kick",
            },
            {
              label: "Ban",
              description: "This is a description as well",
              value: "Ban",
            },
          ])
      );

      const client = new MongoClient(uri);

      const exampleEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Some title")
        .setURL("https://discord.js.org/")
        .setAuthor({
          name: "Some name",
          iconURL: "https://i.imgur.com/AfFp7pu.png",
          url: "https://discord.js.org",
        })
        .setDescription("Some description here")
        .setThumbnail("https://i.imgur.com/AfFp7pu.png")
        .addFields(
          { name: "Regular field title", value: "Some value here" },
          { name: "\u200B", value: "\u200B" },
          {
            name: "Inline field title",
            value: "Some value here",
            inline: true,
          },
          { name: "Inline field title", value: "Some value here", inline: true }
        )
        .addField("Inline field title", "Some value here", true)
        // .setImage('https://ps.w.org/banhammer/assets/icon-128x128.jpg?rev=1805470')
        .setTimestamp()
        .setFooter({
          text: "Some footer text here",
          iconURL: "https://i.imgur.com/AfFp7pu.png",
        });

      interaction.channel.send({ embeds: [exampleEmbed] });

      //updating the library
      try {
        await client.connect();

        await findListingByName(client, `${mentionable.user.id}`);
        // Update the Infinite Views listing to have 6 bedrooms and 8 beds
      } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
      }

      async function updateListingByName(
        client,
        nameOfListing,
        updatedListing
      ) {
        // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateOne for the updateOne() docs
        const result = await client
          .db("discordVWBot")
          .collection("testingCollection")
          .updateOne({ id: nameOfListing }, { $set: updatedListing });

        console.log(
          `   ${result.matchedCount} document(s) matched the query criteria.`
        );
        console.log(`   ${result.modifiedCount} document(s) updated.`);
      }

      async function findListingByName(client, nameOfListing) {
        // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne for the findOne() docs
        const result = await client
          .db("discordVWBot")
          .collection("testingCollection")
          .findOne({ id: nameOfListing });

        // await updateListingByName(client, `${mentionable.user.id}`, { warns: 3 });

        if (result) {
          console.log(
            `Found a listing in the db with the name '${nameOfListing}':`
          );
          console.log(result);
          switch (result.warns) {
            case 0:
              await updateListingByName(client, `${mentionable.user.id}`, {
                warns: 1,
              });
              break;
            case 1:
              await updateListingByName(client, `${mentionable.user.id}`, {
                warns: 2,
              });
              break;
            case 2:
              await updateListingByName(client, `${mentionable.user.id}`, {
                warns: 3,
              });
              break;
          }
        } else {
          // create a new library
          try {
            // Make the appropriate DB calls

            // Create a single new listing
            await createListing(client, {
              username: `${mentionable.user.username}`,
              id: `${mentionable.user.id}`,
              warns: 1,
            });
          } catch (e) {
            console.error(e);
          }
        }
      }

      await interaction.reply({
        content: "test for discord menus",
        components: [row],
      });

      async function createListing(client, newListing) {
        // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne for the insertOne() docs
        const result = await client
          .db("discordVWBot")
          .collection("testingCollection")
          .insertOne(newListing);
        console.log(`No listing was found`);
        console.log(
          `Made a listing created with the following id: ${result.insertedId
          } \nFor ${(mentionable.user.username, mentionable.user.tag)}`
        );
      }
    }
  },
};
