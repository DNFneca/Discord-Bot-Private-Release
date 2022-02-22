const { SlashCommandBuilder } = require("@discordjs/builders");
const { uri } = require("../config.json");
const { MongoClient } = require("mongodb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("This server's stats"),
    async execute(interaction) {
        const client = new MongoClient(uri);

        try {
            await countListingByName(client, interaction);
            // Update the Infinite Views listing to have 6 bedrooms and 8 beds
        } catch (error) {
            console.error(error);
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
            `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}\nThis server has ${estimate} warns in the database`
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