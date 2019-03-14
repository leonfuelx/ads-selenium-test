const webdriver = require('selenium-webdriver');
const mySql = require('./mysql.js');
require('./fast-selenium.js');

mySql.connect();

let activeClientsQuery = `SELECT * from enterprises`

mySql.query(activeClientsQuery, function (error, results, fields) {
  if (error) throw error;
})

let date = new Date().toString().slice(0, 15)

// Input capabilities
const capabilities = {
  'browserName': 'Safari',
  'browser_version': '12.0',
  'os': 'OS X',
  'os_version': 'Mojave',
  'resolution': '1920x1080',
  'project': 'test',
  'build': date,
  'browserstack.user': 'leonwang3',
  'browserstack.key': 'JjxqP423VEJqACjztxWj',
  'browserstack.networkLogs': 'true',
  'acceptSslCerts': 'true',
  'browserstack.debug': 'true',
  'browserstack.local': 'true'
}

const activeClients = ['trueandco.com', 'manscaped.com']


async function appleMacTests() {
  try {
    let appleOs = ['Mojave', 'High Sierra'];
    let browser = ['Safari', 'Chrome'];
    let chromeVersion = ['60', '72']
  
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
  
          for (let z = 0; z < activeClients.length; z++) {
            await buildDriver(activeClients[z])
            // console.log(activeClients[z], capabilities)
          }
        }
  
        if (browser[j] === 'Chrome') {
          for (let y = 0; y < chromeVersion.length; y++) {
            capabilities.browser_version = chromeVersion[y];
            for (let z = 0; z < activeClients.length; z++) {
              await buildDriver(activeClients[z])
              // console.log(activeClients[z], capabilities)
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
  
    await driver.get(`http://www.${client}`).then(function () {
      driver.getTitle().then(function (title) {
        console.log(title);
        setTimeout(() => { driver.quit(); }, 3000)
      })
    })

  } catch(error) {
    console.error(error);
  }
}


function testInit() {
  appleMacTests();
}

testInit();

// const API = require('./api')
