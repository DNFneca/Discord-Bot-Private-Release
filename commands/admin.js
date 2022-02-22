const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("ADMIN??"),
  async execute(interaction) {
    await interaction.reply("...testing in progress?");
  },
};
