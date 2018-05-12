/**
 * @file MMM-NetworkConnection.js
 *
 * @author slametps
 * @license MIT
 *
 * @see https://github.com/slametps/MMM-NetworkConnection
 */

Module.register('MMM-NetworkConnection', {

	// Default module config.
	defaults: {
		updateInterval: 60 * 1000,
		animationSpeed: 2.5 * 1000,
    maxTime: 5 * 1000,
		initialLoadDelay: 2.5 * 1000,
    decimal: 1,
    displayTextStatus: true,
    language: config.language || 'en',
	},

	getScripts: function() {
	    return ["moment.js"];
	},

  // Subclass getStyles method.
  getStyles: function () {
    return ['font-awesome.css'];
  },

  // Define required translations.
	getTranslations: function() {
    return {
      'en': 'translations/en.json',
      'id': 'translations/id.json'
    };
	},

	// Define start sequence.
	start: function() {
		Log.info('Starting module: ' + this.name);
    var self = this;

    // Set locale
		moment.locale(self.config.language);

    this.downloadSpeed = -1;
    this.uploadSpeed = -1;
    this.pingDelay = -1;
    this.firstLoad = true;

		setTimeout(() => {
      this.testUpdate();
      setInterval(() => {
        this.testUpdate();
      }, self.config.updateInterval);
    }, self.config.initialLoadDelay);
	},

	// Override dom generator.
	getDom: function() {
    var self = this;
		var wrapper = document.createElement('div');

    if (self.firstLoad && self.pingDelay == -1) {
      wrapper.className = "bright small light";
      wrapper.innerHTML = this.translate("LOADING");
    }
    else {
      self.firstLoad = false;
      var connectionActive = this.checkConnection();

      if (connectionActive) {
        wrapper.className = 'small';
        let s = ''
        if (self.config.displayTextStatus) {
          s += this.translate("NETCONN_CONNECTED");
          s += " (";
        }
        s += "<span class=\"fa fa-cloud\"></span> "+ (self.pingDelay > -1 ? self.pingDelay + this.translate("NETCONN_MILLISECOND") : this.translate("NETCONN_NA"));
        s += " ";
        s += "<span class=\"fa fa-download\"></span>"+ (self.downloadSpeed > -1 ? self.downloadSpeed + "Mbps" : this.translate("NETCONN_NA"));
        s += " ";
        s += "<span class=\"fa fa-upload\"></span> "+ (self.uploadSpeed > -1 ? self.uploadSpeed + "Mbps" : this.translate("NETCONN_NA"));
        if (self.config.displayTextStatus) {
          s += ")";
        }
        wrapper.innerHTML = s;
      } else {
        wrapper.className = 'normal bright';
        wrapper.innerHTML = this.translate("NETCONN_NOTCONNECTED");
      }
    }

		return wrapper;
	},

	checkConnection: function() {
		return window.navigator.onLine;
	},

  testUpdate: function() {
    this.sendSocketNotification('NETCONN_TEST_START', {'config':this.config});
  },

	/*testUpdate: function(delay, fn) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== 'undefined' && delay >= 0) {
			nextLoad = delay;
		}

		var self = this
		setInterval(function() {
			self.getDom();
		}, nextLoad);
	},*/

  socketNotificationReceived: function(notification, payload) {
    if (notification == 'NETCONN_RESULT_DOWNLOAD') {
      this.downloadSpeed = payload;
    }
    if (notification == 'NETCONN_RESULT_UPLOAD') {
      this.uploadSpeed = payload;
    }
    if (notification == 'NETCONN_RESULT_PING') {
      this.pingDelay = payload;
    }
    this.updateDom(this.config.animationSpeed);
  }
});
