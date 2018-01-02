function loadErisMods (Eris) {
  const MessageCollector = this.MessageCollector;
  Object.defineProperty(Eris.Channel.prototype, 'awaitMessages', {
    value: function (client, filter, options) {
      const collector = new MessageCollector(client, this, filter, options);
      return new Promise(resolve => {
        collector.on('end', (...args) => {
          resolve(args);
        });
      });
    }
  });

  return Eris;
}

module.exports = loadErisMods;