const { SlashCommandBuilder } = require("@discordjs/builders");
const { Guild } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("create")
        .setDescription("Create a new vc")
        .addSubcommand((subcommand) =>
            subcommand
            .setName("call")
            .setDescription("the name that will be given to the call")
            .addStringOption((option) =>
                option
                .setName("name")
                .setDescription("type the name of the call")
                .setRequired(true)
            )
            .addNumberOption((option) =>
                option
                .setName("time")
                .setDescription("deletion time for the vc in hours, default is 0, 0 means its deleted when everyuone leaves")
                .setRequired(false)
            )
        ),
    async execute(interaction) {

        // console.log(interaction.options.getNumber("time"));
        if (interaction.member.voice.channel === undefined || interaction.member.voice.channel === null) interaction.reply("You need to be in a voice channel to use this command");

        if (interaction.options.getNumber("time") < 0) {
            interaction.reply("time must be greater than 0");
        } else if (interaction.options.getNumber("time") > 0 && interaction.options.getNumber("time") <= 86400) {

            if (interaction.guild.channels.cache.find(channel => channel.name === "temporary VCs") === undefined || interaction.guild.channels.cache.find(channel => channel.name === "temporary VCs") === null) {
                await interaction.guild.channels.create('temporary VCs', {
                    type: 'GUILD_CATEGORY',
                    permissionOverwrites: [{
                        id: interaction.guild.id,
                        allow: ['VIEW_CHANNEL'],
                    }]
                })
            }
            //
            const categoryId = interaction.guild.channels.cache.find(channel => channel.name === "temporary VCs").id;

            await interaction.guild.channels.create(
                interaction.options.getString("name"), {
                    type: 'GUILD_VOICE',
                    parent: categoryId,
                });


            const chatName = interaction.guild.channels.cache.find(channel => channel.name === interaction.options.getString("name"))
            const chatIdDelete = interaction.guild.channels.cache.find(channel => channel.name === interaction.options.getString("name")).id
            const fetchedChannel = interaction.guild.channels.cache.get(`${chatIdDelete}`);
            console.log(`A VC named ${chatName} has been created`);
            // await interaction.reply("hey!");


            // interaction.reply("hey!");
            // await fetchedChannel.delete({ timeout: 5000 });
            interaction.reply(`A VC named ${chatName} has been created`);
            await interaction.member.voice.setChannel(fetchedChannel);
            setTimeout(() => {
                fetchedChannel.delete();
            }, interaction.options.getNumber("time") * 3600000);

            // const sleep = (milliseconds) => {
            //     return new Promise(resolve => setTimeout(resolve, milliseconds))
            // }
            // createVC(interaction);


        } else if (interaction.options.getNumber("time") === null || interaction.options.getNumber("time") === 0) {
            if (interaction.member.voice.channel != null) {
                if (interaction.guild.channels.cache.find(channel => channel.name === "new VCs") === undefined || interaction.guild.channels.cache.find(channel => channel.name === "temporary VCs") === null) {
                    await interaction.guild.channels.create('new VCs', {
                        type: 'GUILD_CATEGORY',
                        permissionOverwrites: [{
                            id: interaction.guild.id
                        }]
                    })
                }
                const categoryId = interaction.guild.channels.cache.find(channel => channel.name === "new VCs").id
                await interaction.guild.channels.create(
                    interaction.options.getString("name"), {
                        type: 'GUILD_VOICE',
                        parent: categoryId,
                    });

                const chatName = interaction.guild.channels.cache.find(channel => channel.name === interaction.options.getString("name"))
                const chatIdDelete = interaction.guild.channels.cache.find(channel => channel.name === interaction.options.getString("name")).id
                const fetchedChannel = interaction.guild.channels.cache.get(`${chatIdDelete}`);

                await interaction.reply(`A VC named ${chatName} has been created, and it will be deleted when everyone leaves`);
                await interaction.member.voice.setChannel(fetchedChannel);
                console.log(`A VC named ${chatName} has been created, and it will be deleted when everyone leaves`);
            }

        } else if (interaction.member.voice.channel === null && interaction.options.getNumber("time") === 0) {
            interaction.reply("you need to be in a voice channel to use this command");
        }



        // await interaction.reply(`made a call named: ${interaction.options.getString("name")}`);
    },
};