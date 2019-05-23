const webdriver = require('selenium-webdriver');
const mySql = require('./mysql.js');

const util = require('util');
const CronJob = require('cron').CronJob;

require('./fast-selenium.js');


new CronJob('0 0 5 * * *', function() {

  let activeLandingPages = `select distinct clickurl from fuelData.bidding where campaignStatus = 4`

  let queryExecution = util.promisify(mySql.query).bind(mySql);
  let noDuplicateSites = [];

  async function dbInit() {
    try {
      let landingPages = await queryExecution(activeLandingPages)
      landingPages = landingPages.map(el => el.clickurl);

      for (let i = 0; i < landingPages.length; i++) {
        if (landingPages[i].indexOf('?') > 0) {
          let index = landingPages[i].indexOf('?');
          noDuplicateSites.push(landingPages[i].slice(0,index));
        } else if (landingPages[i][landingPages[i].length-1] === '/') {
          noDuplicateSites.push(landingPages[i].slice(0,landingPages[i].length-1))
        } else {
          noDuplicateSites.push(landingPages[i]);
        }
      }
      noDuplicateSites = Array.from(new Set([...noDuplicateSites]));
      console.log('Live Clients: ');
      console.log('No Duplicate Sites', noDuplicateSites);
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
              await buildDriver(noDuplicateSites[z])
              // console.log(noDuplicateSites[z], capabilities)
            }
          }
    
          if (browser[j] === 'Chrome') {
            for (let y = 0; y < chromeVersion.length; y++) {
              capabilities.browser_version = chromeVersion[y];
              for (let z = 0; z < noDuplicateSites.length; z++) {
                await buildDriver(noDuplicateSites[z])
                // console.log(noDuplicateSites[z], capabilities)
              }
            }
          }
    
        }
      }

    } catch(error) {
      console.error('ERROR in AppleTests: ', error);
    }

  }

  async function buildDriver(client) {
    try {
      let driver = new webdriver.Builder().
        usingServer('http://hub-cloud.browserstack.com/wd/hub').
        withCapabilities(capabilities).
        build();
    
      await driver.get(`${client}`).then(function () {
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
}, null, true, 'America/Los_Angeles');
