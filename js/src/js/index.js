(function() {
  'use strict';

  let common, settings;
  
  const Common = function() {
    this.initialize.apply(this, arguments);
  };

  Common.prototype.initialize = function() {

  };

  Common.prototype.setEvent = function() {

  };

  Common.prototype.run = function() {
    this.setEvent();
  };


  const Settings = function() {
    this.initialize.apply(this, arguments);
  };

  Settings.prototype.initialize = function() {

  };

  Settings.prototype.setEvent = function() {

  };

  Settings.prototype.run = function() {
    this.setEvent();
  };


  window.addEventListener('DOMContentLoaded', function() {
    common = new Common();
    common.run();

    settings = new Settings();
    settings.run();
  });

}());