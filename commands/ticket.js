const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'ticket',
    description: 'Create a new ticket',
    async execute(message, args, client) {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Venez nous rendre visite')
            .setDescription('Vous voulez prendre rendez-vous ? Sélectionnez l’option : RDV\n\nVous voulez être recruté ? Sélectionnez l’option : Recrut.\n\nAutre…');

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('rdv')
                    .setLabel('RDV')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('recrut')
                    .setLabel('Recrut')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('other')
                    .setLabel('Autre...')
                    .setStyle(ButtonStyle.Secondary)
            );

        await message.channel.send({ embeds: [embed], components: [buttonRow] });

        const filter = i => i.customId === 'rdv' || i.customId === 'recrut' || i.customId === 'other';
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: 'You cannot use this button.', ephemeral: true });
            }

            let categoryId;
            let channelName;

            if (i.customId === 'rdv') {
                categoryId = '1342861433972592700';
                channelName = `📆-${message.author.username}`;
            } else if (i.customId === 'recrut') {
                categoryId = '1342861472589418648';
                channelName = `📨-${message.author.username}`;
            } else if (i.customId === 'other') {
                categoryId = '1342861454302253087';
                channelName = `🎬-${message.author.username}`;
            }

            const categoryChannel = client.channels.cache.get(categoryId);

            if (!categoryChannel) {
                return i.reply({ content: `Category does not exist.`, ephemeral: true });
            }

            const existingTicket = categoryChannel.children.cache.find(c => c.name.includes(message.author.username));
            if (existingTicket) {
                return i.reply({ content: `You already have an open ticket in the selected category.`, ephemeral: true });
            }

            const ticketChannel = await message.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: categoryChannel.id,
                permissionOverwrites: [
                    {
                        id: message.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: message.author.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                ],
            });

            const ticketEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('New Ticket')
                .setDescription('Please describe your issue in detail.');

            const closeButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close')
                        .setLabel('Close')
                        .setStyle(ButtonStyle.Danger)
                );

            await ticketChannel.send({ embeds: [ticketEmbed], components: [closeButton] });

            i.reply({ content: `Ticket created: ${ticketChannel}`, ephemeral: true });

            const closeFilter = x => x.customId === 'close' && x.channelId === ticketChannel.id;
            const closeCollector = ticketChannel.createMessageComponentCollector({ closeFilter, time: 60000 });

            closeCollector.on('collect', async x => {
                if (x.user.id !== message.author.id) {
                    return x.reply({ content: 'You cannot use this button.', ephemeral: true });
                }

                await ticketChannel.delete();
                x.reply({ content: 'Ticket closed.', ephemeral: true });
            });
        });
    },
};