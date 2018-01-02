// TODO: Add back this line when the website rewrite is done
// \n • Your name and a custom phrase on [RemindMeBot\'s website](http://remindmebot.xyz/) (At least $2.00)
async function donateCommand () {
  return {
    description: 'RemindMeBot will always remain a free service. However, if you would like to donate, you can do so [here](https://paypal.me/Aether2017) (PayPal) or to `18UNsWHGvskZSxKc6LvyaqwKk5FUf2af4D` (BTC).' + // TODO: host a list of all of my crypto addresses on rmb.xyz and link that instead
    '\n\nAs a donator, you will receive:\n' +
    ' • A `Donator` role on [RemindMeBot Support](https://discord.gg/Yphr6WG) (Any amount)\n' +
    ' • Your name and a custom phrase on the #donators channel on [RemindMeBot Support](https://discord.gg/Yphr6WG) (Any amount)\n' +
    ' • Your name and a custom phrase on this command (At least $1.00)\n' +
    ' • Lots of hugs & kisses from Aetheryx (Any amount :kissing_heart:)\n\u200b',
    fields: [
      { name: 'Donators so far', value: 'None! You should totally be the first.' }
    ],
    footer: { text: 'If you do decide to donate, please DM Aetheryx#2222 with proof.' }
  };
}

module.exports = {
  call: donateCommand,
  name: 'donate',
  description: 'Returns information regarding donations.'
};