const schedule = require("node-schedule");

const MailVerification = require('../models/mailVerification.model');
const PhoneVerification = require('../models/phoneVerification.model');

function scheduler() {
    const job = schedule.scheduleJob("30 2 * * *", function () {
        var currentTimestamp = Date.now();
        MailVerification.deleteAllByTime(currentTimestamp);
        PhoneVerification.deleteAllByTime(currentTimestamp);
    });
}

module.exports = scheduler;