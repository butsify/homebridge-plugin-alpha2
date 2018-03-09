const Service, Characteristic;
const request = require('request');
const url = require('url');
const log;
 
module.exports = function (homebridge) {
  this.Service = homebridge.hap.Service;
  this.Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("switch-plugin", "PUTOSwitch", mySwitch);
};

function mySwitch(log, config) {
  this.log = log;
  this.getUrl = url.parse(config['getUrl']);
  this.postUrl = url.parse(config['postUrl']);
}

mySwitch.prototype = {
  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "PUTO")
      .setCharacteristic(Characteristic.Model, "model")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    let switchService = new Service.Switch("Anwesend Wohnzimmer");
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getSwitchOnCharacteristic.bind(this))
        .on('set', this.setSwitchOnCharacteristic.bind(this));
 
    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
  },

  getSwitchOnCharacteristic: function (next) {
    const me = this;
    request({
        url: me.getUrl,
        method: 'GET',
    }, 
    function (error, response, body) {
      if (error) {
        me.log('STATUS: ' + response.statusCode);
        me.log(error.message);
        return next(error);
      }
      return next(null, body.currentState);
    });
  },
   
  setSwitchOnCharacteristic: function (on, next) {
    const me = this;
    request({
      url: me.postUrl,
      body: {'targetState': on},
      method: 'POST',
      headers: {'Content-type': 'application/json'}
    },
    function (error, response) {
      if (error) {
        me.log('STATUS: ' + response.statusCode);
        me.log(error.message);
        return next(error);
      }
      return next();
    });

};