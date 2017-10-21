var tourlist = require('../controllers/tourlist.server.controller.js');

module.exports = function(app){
  app.route('/tourlist/:type/:page')
  .get(tourlist.list);
}
