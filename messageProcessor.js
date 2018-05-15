/*
* IoT Hub Raspberry Pi NodeJS - Microsoft Sample Code - Copyright (c) 2017 - Licensed MIT
*/
'use strict';

const Bme280Sensor = require('./bme280Sensor.js');
const Mcp3008Sensor = require('./mcp3008.js');
const SimulatedSensor = require('./simulatedSensor.js');
const tempSensor = require('mc-tempsensor');

var soil_temperature0 = 0;

function MessageProcessor(option) {
  option = Object.assign({
    deviceId: '[Unknown device] node',
    temperatureAlert: 30
  }, option);
  this.sensor = option.simulatedData ? new SimulatedSensor() : new Bme280Sensor(option.i2cOption);
  var MCP3008 = require('./mcp3008.js').MCP3008; // This is a class. Explicit location (path), not in 'node_modules'.
  this.mcp3008 = new MCP3008(); // Uses the default pins. See mcp3008.js for details.
  this.deviceId = option.deviceId;
  this.temperatureAlert = option.temperatureAlert
  this.sensor.init(() => {
    this.inited = true;
  });
  tempSensor.init('/sys/bus/w1/devices/28-0117b3aaa3ff/w1_slave',{defaultPath: false, installKernelMod: false}) ;

  
}

function cToF(celsius) 
{
  var cTemp = celsius;
  var cToFahr = cTemp * 9 / 5 + 32;
  return cToFahr;
}

function fToC(fahrenheit) 
{
  var fTemp = fahrenheit;
  var fToCel = (fTemp - 32) * 5 / 9;
  return fToCel;
} 



MessageProcessor.prototype.getMessage = function (messageId, cb) {
  if (!this.inited) { return; }
  var adc = this.mcp3008.readAdc(this.mcp3008.channels.CHANNEL_0);

  var adc1 = this.mcp3008.readAdc(this.mcp3008.channels.CHANNEL_1);

  var adc2 = this.mcp3008.readAdc(this.mcp3008.channels.CHANNEL_2);

  var adc4 = this.mcp3008.readAdc(this.mcp3008.channels.CHANNEL_4);

  var adc6 = this.mcp3008.readAdc(this.mcp3008.channels.CHANNEL_6);

  var adc7 = this.mcp3008.readAdc(this.mcp3008.channels.CHANNEL_7);

  tempSensor.readAndParse(function(err, data) {
  if (err) {
    // Handle error
    console.log( 'Error::' , err);
    soil_temperature0 = 0;
  } else {
    //console.log('data:::' , data);
    //console.log('data[0]::::', data[0] );    
    //console.log('Temperature is ' + data[0].temperature.fahrenheit + ' F');
    //console.log('Temperature is ' + data[0].temperature.celcius + ' C');

    soil_temperature0 = data[0].temperature.fahrenheit;
  }
 } );
  
  this.sensor.read((err, data) => {
    if (err) {
      console.log('[Sensor] Read data failed: ' + err.message);
      return;
    }

    var tempInFer = cToF( data.temperature );

    cb(JSON.stringify({
      messageId: messageId,
      deviceId: this.deviceId,
      temperature: tempInFer,
      humidity: data.humidity,
      soil_moisture0: adc,
      soil_moisture1: adc1,
      soil_moisture2: adc2,
      soil_moisture6: adc6,
      soil_moisture7: adc7,
      soil_temperature0: soil_temperature0,      
      analog_channel_4: adc4
    }), data.temperature > this.temperatureAlert);
  });
}

module.exports = MessageProcessor;
