module.exports = {
    name: "voiceStateUpdate",
    async execute(oldMember, newMember) {
        let newUserChannel = newMember.channelId;
        let oldUserChannel = oldMember.channelId;
        // console.log(newMember);
        // console.log(oldMember);




        // console.log(this.guild.channels.cache.get(this.newMember.channelId));
        if (oldUserChannel != null || oldUserChannel != undefined && newUserChannel != null) {
            const oldCategoryId = oldMember.channel.parentId;
            // console.log(oldMember.channel.members.size);
            // console.log(newMember.channel.members.size);
            const category = oldMember.guild.channels.cache.find(channel => channel.name === "new VCs");
            try {
                const categoryId = category.id;
                if (oldCategoryId === categoryId) {
                    if (oldMember.channel.members.size === 0) {
                        const fetchedChannel = oldMember.guild.channels.cache.get(`${oldUserChannel}`);
                        await deleteChannel(fetchedChannel);
                    }
                }
            } catch (e) {
                console.log(e);
                return;
            }

            // console.log(`Moved from ${oldUserChannel} to ${newUserChannel}`)
        } else if (newUserChannel === null || newUserChannel === undefined) {
            const oldCategoryId = oldMember.channel.parentId;
            // User leaves a voice channel
            // console.log(`Left ${oldUserChannel}`);

        } else if (newUserChannel != null || newUserChannel != undefined && oldUserChannel === null) {
            const newCategoryId = newMember.channel.parentId;
            // User Joins a voice channel
            // console.log(`Joined ${newUserChannel}`);

        }
    },
};

async function deleteChannel(channelId) {
    await channelId.delete();
}