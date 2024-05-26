const { Telegraf, Markup } = require('telegraf');

// Token for accessing the Telegram Bot API
const token = '7207778038:AAH2P5Kx3Me1zF6_c0VgZmJnt3bLDIlbcBM';

// Create a new instance of Telegraf bot
const bot = new Telegraf(token);

// Command handler for /start command
bot.start((ctx) => {
    const user = ctx.from;
    ctx.reply(`Hello ${user.first_name}! Welcome to the Loan Airtime Bot. Select your desired loan amount below:`,
        Markup.inlineKeyboard([
            Markup.button.callback('500 Tsh', '500'),
            Markup.button.callback('1000 Tsh', '1000'),
            Markup.button.callback('2000 Tsh', '2000'),
        ])
    );
});

// Callback handler for button clicks
bot.action(/.+/, (ctx) => {
    const loanAmount = ctx.match[0];
    const user = ctx.from;
    ctx.answerCbQuery();
    ctx.reply(`Dear ${user.first_name}, your loan request of ${loanAmount} Tsh has been received. The airtime will be credited to your account shortly.`);
});

// Command handler for /help command
bot.help((ctx) => {
    ctx.reply('This bot allows you to request a loan airtime. Simply click on the desired loan amount.');
});

// Start the bot
bot.launch().then(() => console.log('Bot is running'));
