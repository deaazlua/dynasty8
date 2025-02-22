const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'close',
    description: 'Close the ticket',
    async execute(message, args) {
        if (!message.channel.name.includes('📆') && !message.channel.name.includes('📨') && !message.channel.name.includes('🎬')) {
            return message.reply('This command can only be used in ticket channels.');
        }

        const reason = args.join(' ') || 'No reason provided';
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Ticket Closed')
            .setDescription(`Reason: ${reason}`);

        await message.channel.send({ embeds: [embed] });
        await message.channel.delete();
    },
};