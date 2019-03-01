let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let ReminderSchema = new Schema({
    text : String,
    date : Date,
    author_id: String,
    chat_id: String,
    checked: Boolean
});

module.exports = mongoose.model('Reminder', ReminderSchema);
