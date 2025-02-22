const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Event when bot is ready
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event when a member joins
client.on('guildMemberAdd', async member => {
    const role = member.guild.roles.cache.get('1342851129196941433');
    if (role) {
        await member.roles.add(role);
    }

    const channel = member.guild.channels.cache.get('1342852004602712084');
    if (channel) {
        channel.send(`Hey, ${member.user}! N'hésite pas à regarder le catalogue dans le salon <#1342845044620525608> !`);
    }
});

// Event when a message is created
client.on('messageCreate', async message => {
    if (!message.content.startsWith('+') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

client.login(process.env.DISCORD_TOKEN);