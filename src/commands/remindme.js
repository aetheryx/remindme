
const [argless, withArgs] = [require('./remindmeArgless.js'), require('./remindmeWithArgs.js')];

exports.run = async function (Bot, msg, args) {
    if (args[0]) {
        withArgs(Bot, msg, args);
    } else {
        argless(Bot, msg);
    }
};

exports.props = {
    name        : 'remindme',
    usage       : '{command}',
    aliases     : ['remind'],
    description : 'Creates a reminder. Pass without args to start a guided tour.'
};