const { uri } = require("../config.json");
const { MongoClient } = require("mongodb");

module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        client.guilds.cache.forEach((guild) => {
            console.log(`${guild.name} | ${guild.id}`);
        });
        const mongoDBClient = new MongoClient(uri);
        try {
            // Connect to the MongoDB cluster
            await mongoDBClient.connect();

            // Make the appropriate DB calls
            await listDatabases(mongoDBClient);
        } catch (e) {
            console.error(e);
        } finally {
            await mongoDBClient.close();
        }
        console.log(`The bot didn't crash`);
    },
};

async function listDatabases(mongoDBClient) {
    databasesList = await mongoDBClient.db().admin().listDatabases();

    console.log("\nDatabases:");
    databasesList.databases.forEach((db) => console.log(` - ${db.name}`));
    console.log("✔️All the databases have loaded!");
}