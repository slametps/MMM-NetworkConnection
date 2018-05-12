/**
 * @file node_helper.js for MMM-NetworkConnection
 *
 * @author slametps
 * @license MIT
 *
 * @see https://github.com/slametps/MMM-NetworkConnection
 */
var NodeHelper = require('node_helper');
var speedtest = require('speedtest-net');

module.exports = NodeHelper.create({
  start: function(){
    console.log(this.name + ' helper started ...');
  },
  socketNotificationReceived : function(notification, payload){
    if(notification == 'NETCONN_TEST_START')
    {
      console.log('starting network connection testing')
      var that = this;
      var st = speedtest({maxTime: payload.config.maxTime || 5000});
      st.on('downloadspeed', function (speed) {
        var download = speed.toFixed(payload.config.decimal);
        //console.log("download : " + download);
        that.sendSocketNotification('NETCONN_RESULT_DOWNLOAD', download);
      });

      st.on('uploadspeed', function (speed) {
        var upload = speed.toFixed(payload.config.decimal);
        //console.log("upload : " + upload);
        that.sendSocketNotification('NETCONN_RESULT_UPLOAD', upload);
      });

      st.once('testserver', function(server){
        var ping = Math.round(server.bestPing);
        //console.log("ping : " + ping);
        that.sendSocketNotification('NETCONN_RESULT_PING', ping);
      });
    }
  }
});
