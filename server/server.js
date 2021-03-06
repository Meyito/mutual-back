// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.

console.log('NODE_ENV', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production' && !process.env.MIGRATE_PERSISTENCE) {
  let cluster = require('cluster');
  if (cluster.isWorker) {
    startWorker();
  } else {
    let control = require('strong-cluster-control');
    let cpuNumber = Number(process.env.CPUS) || control.CPUS;
    control.start({
      size: cpuNumber,
      throttleDelay: 5000
    });
    console.log('CPUs: ', cpuNumber);
  }
} else {
  startWorker();
}

function startWorker () {
  const fs = require("fs")
  if (process.env.NODE_ENV === 'production') {
    let access = fs.createWriteStream(process.env.LOGDIR + '/access.log', {flags: 'a'})
    let error = fs.createWriteStream(process.env.LOGDIR + '/error.log', {flags: 'a'});

    process.stdout.pipe(access);
    process.stderr.pipe(error);
  }

  const loopback = require('loopback');
  const boot = require('loopback-boot');
  const knex = require('knex');
  const moment = require("moment")
  moment.locale("es");

  require('./children-model-setup')(loopback);

  let app = module.exports = loopback();

  app.start = function () {
    // start the web server
    return app.listen(function () {
      app.emit('started');
      let baseUrl = app.get('url').replace(/\/$/, '');

      console.log('Web server listening at: %s', baseUrl);
      if (app.get('loopback-component-explorer')) {
        var explorerPath = app.get('loopback-component-explorer').mountPath;
        console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
      }
    });
  };

  boot(app, __dirname, function (err) {
    if (err) throw err;

    app.knex = knex(app.get('knex'))
    // start the server if `$ node server.js`
    if (require.main === module || process.env.NODE_ENV === 'test')
      app.currentServer = app.start();
  });
}
