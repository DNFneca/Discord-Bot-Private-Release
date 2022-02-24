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
        if (!interaction.member.permissions.has(
                Permissions.FLAGS.ADMINISTRATOR ||
                Permissions.FLAGS.KICK_MEMBERS ||
                Permissions.FLAGS.BAN_MEMBERS ||
                Permissions.FLAGS.VIEW_AUDIT_LOG
            ))
            return interaction.reply({
                content: `You don't have the permission to view history`,
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
            const client = new MongoClient(uri);
            await countListingByName(client, interaction);
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
                            content: `${mentionable.user} has been warned once`,
                        });
                        break;
                    case 1:
                        await interaction.reply({
                            content: `${mentionable.user} has been warned twice`,
                        });
                        break;
                    case 2:
                        await interaction.reply({
                            content: `${mentionable.user} has been warned three times`,
                        });
                }
            } else await interaction.reply({ content: `${mentionable.user} hasn't been warned yet, great!` })
        }
    },
};


async function countListingByName(client, interaction) {
    try {
        await client.connect();
        const database = client.db(`${interaction.guild.id}`);
        const movies = database.collection("Warnings");
        // Estimate the total number of documents in the collection
        // and print out the count.
        const estimate = await movies.estimatedDocumentCount();
        await interaction.reply(
            `This server has ${estimate} warns in the database`
        );
        // Query for movies from Canada.
        // const query = { warns: "0", warns: "1", warns: "2", warns: "3" };
        // // Find the number of documents that match the specified
        // // query, (i.e. with "Canada" as a value in the "countries" field)
        // // and print out the count.
        // const countCanada = await movies.countDocuments(query);
        // console.log(`Number of movies from Canada: ${countCanada}`);
    } finally {
        await client.close();
    }
}