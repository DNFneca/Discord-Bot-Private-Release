const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageSelectMenu } = require("discord.js");
const { uri } = require("../config.json");
const { mongoose } = require("mongoose");
const { MongoClient } = require("mongodb");
const { Permissions } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("A warn command")
        .addMentionableOption((option) =>
            option
            .setName("mentionable")
            .setDescription("Mention something")
            .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(
                Permissions.FLAGS.ADMINISTRATOR ||
                Permissions.FLAGS.KICK_MEMBERS ||
                Permissions.FLAGS.BAN_MEMBERS
            ))
            return interaction.reply({ content: `You don't have the permission to warn`, ephemeral: true });

        const mentionable = interaction.options.getMentionable("mentionable");

        if (mentionable.user.bot == true) {
            await interaction.reply({ content: "You can't mention a bot", ephemeral: true });
        } else {
            const client = new MongoClient(uri);

            //   const row = new MessageActionRow().addComponents(
            //     new MessageSelectMenu()
            //     .setCustomId("select")
            //     .setPlaceholder("Nothing selected")
            //     .setMaxValues(1)
            //     .addOptions([{
            //             label: "Ignore",
            //             description: "Resets the user's warning back to 1",
            //             value: "Ignore",
            //         },
            //         {
            //             label: "Mute",
            //             description: "This will manually mute user until further notice",
            //             value: "Mute",
            //         },
            //         {
            //             label: "Kick",
            //             description: "This will kick the user from the current server",
            //             value: "Kick",
            //         },
            //         {
            //             label: "Ban",
            //             description: "This will ban the user from the current server",
            //             value: "Ban",
            //         },
            //     ])
            // );

            //updating the library
            try {
                await client.connect();

                await findListingByName(client, `${mentionable.user.id}`);
                // Update the Infinite Views listing to have 6 bedrooms and 8 beds
            } finally {
                // Close the connection to the MongoDB cluster
                await client.close();
            }

            /*

                          FUNCTIONSSSSSSSSSSSSSSSSSSSSSS

            */

            async function updateListingByName(
                client,
                nameOfListing,
                updatedListing
            ) {
                // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateOne for the updateOne() docs
                const result = await client
                    .db(`${interaction.guild.id}`)
                    .collection("Warnings")
                    .updateOne({ id: nameOfListing }, { $set: updatedListing });

                console.log(
                    `   ${result.matchedCount} document(s) matched the query criteria.`
                );
                console.log(`   ${result.modifiedCount} document(s) updated.`);
            }

            async function findListingByName(client, nameOfListing) {
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
                            await updateListingByName(client, `${mentionable.user.id}`, {
                                warns: 1,
                            });
                            await interaction.reply({
                                content: `${mentionable.user} has been warned, this is his 2nd warning`,
                            });
                            break;
                        case 1:
                            await updateListingByName(client, `${mentionable.user.id}`, {
                                warns: 2,
                            });
                            await interaction.reply({
                                content: `${mentionable.user} has been warned, this is his 3rd warning and final warning`,
                            });
                            break;
                        case 3:
                            await updateListingByName(client, `${mentionable.user.id}`, {
                                warns: 0,
                            });
                            await interaction.reply({
                                content: `${mentionable.user} has been warned 5 times, setting it back to his first warning!`,
                            });
                            break;
                        case 2:
                            await updateListingByName(client, `${mentionable.user.id}`, {
                                warns: 3,
                            });
                            //   await interaction.reply({ content: `${mentionable.user.tag}'s warning have been reset to 1 due to an issue with the bot, report this immediately to the developers at https://discord.gg/D9snA2XHc3` });

                            const { MessageEmbed } = require("discord.js");

                            // inside a command, event listener, etc.
                            const userwarnsEmbed = new MessageEmbed()
                                .setColor("#0099ff")
                                .setTitle("Last warning options")
                                .setAuthor({
                                    name: `${mentionable.user.username}'s case`,
                                    //   iconURL: "https://i.imgur.com/AfFp7pu.png",
                                    //   url: "https://discord.js.org",
                                })
                                .setDescription(
                                    "The user was automatically muted, you can give 'warns' as a ban,kick or mute reason"
                                )
                                // .setThumbnail("https://i.imgur.com/AfFp7pu.png")
                                .addFields({
                                    name: "You have a couple of options for this user",
                                    value: "You can:",
                                }, { name: "\u200B", value: "\u200B" }, {
                                    name: "Ban",
                                    value: "This options will ban the user",
                                    inline: true,
                                }, {
                                    name: "Kick",
                                    value: "This options will kick the user",
                                    inline: true,
                                })
                                .addField("Mute", "This options will mute the user", true)
                                // .setImage(
                                //   "https://ps.w.org/banhammer/assets/icon-128x128.jpg?rev=1805470"
                                // )
                                .setTimestamp()
                                .setFooter({
                                    text: "This is directed towards admins there are options to mute kick and ban users if this is visible to everyone be careful",
                                    // iconURL: '../VirtualWorld.jpg',
                                });

                            await interaction.reply({
                                content: `${mentionable.user} has been warned 4 times you have the option to get ${mentionable.user} under control`,
                                ephemeral: false,
                                embeds: [userwarnsEmbed],
                            });
                            // await interaction.channel.send({
                            //   content: ``,
                            //   embeds: [userwarnsEmbed]
                            // })
                            break;
                    }
                } else {
                    // create a new library
                    try {
                        // Make the appropriate DB calls

                        // Create a single new listing
                        await createListing(client, {
                            username: `${mentionable.user.tag}`,
                            id: `${mentionable.user.id}`,
                            warns: 0,
                        });
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            async function createListing(client, newListing) {
                // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne for the insertOne() docs
                const result = await client
                    .db(`${interaction.guild.id}`)
                    .collection("Warnings")
                    .insertOne(newListing);
                console.log(`No listing was found`);
                console.log(
                    `Made a listing created with the following id: ${result.insertedId
          } \nFor ${(mentionable.user.username, mentionable.user.tag)}`
                );
                await interaction.reply({
                    content: `${mentionable.user} has been warned, this is his 1st warning`,
                });
            }
        }
    },
};