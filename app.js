
const mongoose = require('mongoose');
const Reminder = require('./models/reminder');
mongoose.connect('mongodb://localhost:27017/reminderbot', { useNewUrlParser: true });
const TelegramBot = require('node-telegram-bot-api');

const token = '----Your token from telegram BigFatherBot--------';
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg, match) => {
    bot.sendMessage(msg.chat.id, msg.from.first_name + ' ' + msg.from.last_name + ', Hello');
    bot.sendMessage(msg.chat.id, 'Write /help');
});

bot.onText(/\/help/, (msg, match) => {
    bot.sendMessage(msg.chat.id, '/create <date>^<text>');
    bot.sendMessage(msg.chat.id, '/all' );
    bot.sendMessage(msg.chat.id, '/create <id>');
});

bot.onText(/\/create(.+)/, async (msg, match) => {
    const authorId = msg.from.id;
    const chatId = msg.chat.id;
    const fulltext = match[1].split('^');
    let date = new Date(fulltext[0]);
    date.setUTCHours(date.getHours());
    let text = fulltext[1];

    const reminder = await Reminder.create({
        text: text,
        author_id: authorId,
        chat_id: chatId,
        date: date,
        checked: false
    });
    bot.sendMessage(chatId, 'Reminder created!');
});

bot.onText(/\/all/, async (msg, match) => {
    const newReminder = await Reminder.find({checked: false, author_id: msg.from.id});
    bot.sendMessage(msg.chat.id, newReminder+':(');
});

bot.onText(/\/delete(.+)/, async  function(msg, match){
    const newVar = await Reminder.findByIdAndRemove(match[1]);
    console.log(newVar);
    bot.sendMessage(msg.chat.id, 'Removed :(');
});

setInterval(async function(){
    let date = new Date();
    date.setUTCHours(date.getHours());
    let reminders = await Reminder.find({checked : false, date: {$lte: date}});
    await Reminder.updateMany({_id: reminders}, {checked: true}, {multi: true});
    for (const r of reminders) {
            bot.sendMessage(r.chat_id, r.text);
        }
    },5000);
