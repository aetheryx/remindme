loadCommands([ // eslint-disable-line no-undef
  {
    Name: 'help',
    Info: 'Returns extra documentation for a specific command (or the list of all commands).',
    Usage: 'r>help [command]',
    Example: 'r>help remind'
  },
  {
    Name: 'remindme',
    Info: 'Creates a reminder. Pass without args to start a guided tour.',
    Usage: 'r>remindme [<time argument> "<message>"]',
    Example: 'r>remindme 12 hours "Buy groceries"'
  },
  {
    Name: 'list',
    Info: ['Sends you your current reminders in DM.', 'Note: will send in channel if DMs are disabled.'],
    Usage: 'r>list'
  },
  {
    Name: 'clear',
    Info: 'Starts a guided tour to clear all of your reminders.',
    Usage: 'r>clear'
  },
  {
    Name: 'forget',
    Info: 'Starts a guided tour to forget one of your reminders.',
    Usage: 'r>forget'
  },
  {
    Name: 'prefix',
    Info: 'Changes your prefix to the given argument.',
    Usage: 'r>prefix <desired prefix>',
    Example: 'r>prefix !!'
  },
  {
    Name: 'invite',
    Info: 'Returns an invite for RemindMeBot and the support server.',
    Usage: 'r>invite'
  },
  {
    Name: 'ping',
    Info: 'Returns the websocket latency to the API servers in ms.',
    Usage: 'r>ping'
  },
  {
    Name: 'stats',
    Info: 'Returns information and statistics about RemindMeBot.',
    Usage: 'r>stats'
  }
]);