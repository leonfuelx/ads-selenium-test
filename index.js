const webdriver = require('selenium-webdriver');
const mySql = require('./mysql.js');
const util = require('util');
const CronJob = require('cron').CronJob;

require('./fast-selenium.js');


// new CronJob('0 0 5,17 * * *', function() {

  let activeClientsQuery = `SELECT distinct url FROM fuelAsset.tracking_pixel a join fuelAsset.campaign b on a.bid = b.bid where b.status = 1;`
  let queryExecution = util.promisify(mySql.query).bind(mySql);
  const activeClients = [];
  const noDuplicateSites = [];

  async function dbInit() {
    try {
      const rows = await queryExecution(activeClientsQuery);
      rows.forEach(client => {
        activeClients.push(client.url)
      })
      // remove 'www' and duplicates from sites
      for (let i = 0; i < activeClients.length; i++) {
        if (activeClients[i].includes('www')) {
          activeClients[i] = activeClients[i].substr(4)
        }
      }

      for (let z = 0; z < activeClients.length; z++) {
        if (noDuplicateSites.indexOf(activeClients[z]) === -1 && !activeClients[z].includes('yahoo')) {
          noDuplicateSites.push(activeClients[z])
        }
      }
    console.log(noDuplicateSites);
    } finally {
      mySql.end();
      console.log('db closed')
    }
  }

  let date = new Date().toString().slice(0, 15);

  // Input capabilities
  const capabilities = {
    'browserName': 'Safari',
    'browser_version': '12.0',
    'os': 'OS X',
    'os_version': 'Mojave',
    'resolution': '1920x1080',
    'project': 'Client_Pixel_Check',
    'build': date,
    'browserstack.user': 'leonwang3',
    'browserstack.key': 'JjxqP423VEJqACjztxWj',
    'browserstack.networkLogs': 'true',
    'acceptSslCerts': 'true',
    'browserstack.debug': 'true',
  }



  async function appleMacTests() {
    try {
      let appleOs = ['Mojave'];
      let browser = ['Chrome'];
      let chromeVersion = ['70']
    
      capabilities.os = 'OS X';
    
      for (let i = 0; i < appleOs.length; i++) {
        capabilities.os_version = appleOs[i];
        for (let j = 0; j < browser.length; j++) {
          capabilities.browserName = browser[j];
          if (browser[j] === 'Safari') {
            switch (appleOs[i]) {
              case 'Mojave':
                capabilities.browser_version = '12'
                break;
              case 'High Sierra':
                capabilities.browser_version = '11.1'
                break;
              case 'Sierra':
                capabilities.browser_version = '10'
                break;
              case 'El Capitan':
                capabilities.browser_version = '9.1'
                break;
              default:
                break;
            }
    
            for (let z = 0; z < noDuplicateSites.length; z++) {
              // console.log(noDuplicateSites[z])
              // await buildDriver(noDuplicateSites[z])
              // console.log(noDuplicateSites[z], capabilities)
            }
          }
    
          if (browser[j] === 'Chrome') {
            for (let y = 0; y < chromeVersion.length; y++) {
              capabilities.browser_version = chromeVersion[y];
              noDuplicateSites.length = 3;
              for (let z = 0; z < noDuplicateSites.length; z++) {
                await buildDriver(noDuplicateSites[z])
                // console.log(noDuplicateSites[z], capabilities)
              }
            }
          }
    
        }
      }

    } catch(error) {
      console.log('ERROR in AppleTests: ', error);
    }

  }

  async function buildDriver(client) {
    try {
      let driver = new webdriver.Builder().
        usingServer('http://hub-cloud.browserstack.com/wd/hub').
        withCapabilities(capabilities).
        build();
    
      await driver.get(`http://${client}`).then(function () {
        driver.getTitle().then(function (title) {
          console.log(title);
          setTimeout(() => { driver.quit(); }, 5000)
        })
      })

    } catch(error) {
      console.error(error);
    }
  }

  async function testInit() {
    await dbInit();
    await appleMacTests();
    setTimeout(function() {
      require('./api.js');
    }, 30000)
  }

  testInit();
// }, null, true, 'America/Los_Angeles');
