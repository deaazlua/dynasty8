const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'add',
    description: 'Add a user to the ticket',
    async execute(message, args) {
        if (!message.channel.name.includes('📆') && !message.channel.name.includes('📨') && !message.channel.name.includes('🎬')) {
            return message.reply('This command can only be used in ticket channels.');
        }

        if (!args[0]) {
            return message.reply('Please mention a user to add.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('User not found.');
        }

        await message.channel.permissionOverwrites.create(user, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
        });

        message.channel.send(`${user} has been added to the ticket.`);
    },
};