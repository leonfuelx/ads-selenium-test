const axios = require('axios');
const username = 'leonwang3';
const password = 'JjxqP423VEJqACjztxWj';

let date = new Date().toString().slice(0, 15);

let browserStackAPI = `https://api.browserstack.com/automate/builds`,
    // buildId = [],
    buildId = 'aa7274f0d602e6b1757409e6c5ce7d5867651731',
    sessionId,
    networkLogs,
    failedSessions = [];

const options = {
    url: `${browserStackAPI}.json`,
    auth: {
        username,
        password
    }
}

const getBuild = async url => {
    const data = await callApi(url);
    for (let i = 0; i < data.length; i++) {
        buildId.push(data[i].automation_build.hashed_id)
    }
}

const getSession = async url => {
    tempArr = [];
    let data = await callApi(url);
        data = data.build.sessions;
    for (let i = 0; i < data.length; i++) {
        tempArr.push(data[i].automation_session.hashed_id);
    }
    return tempArr;
} 


const getSessionData = async (arr, buildid) => {
    for (let i = 0; i < arr.length; i++) {
        const failDetails = {};
        try {
            sessionId = arr[i];
            options.url = `${browserStackAPI}/${buildid}/sessions/${sessionId}.json`
            let data = await callApi(options.url);
            logs = data.automation_session.logs;
            consoleLogs = data.automation_session.browser_console_logs_url;
            networkLogs = `${data.automation_session.browser_url}/networklogs`
            console.log('SESSIONID', sessionId)
            let status = await getNetworkData(networkLogs);
    
            if (status) {
                failDetails[sessionId] = status;
                failedSessions.push(failDetails);
            }
            
            options.url = '';
            console.log('============================================')
        } catch(e) {
            console.log('getSessionData Error: ', sessionId)
            failDetails[sessionId] = 'SessionData Error';
            failedSessions.push(failDetails);
            continue;
        }
    }
    console.log('Session Logs', failedSessions)
}

const getNetworkData = async url => {
    const data = await callApi(url)
    let entries = data.log.entries;
    let scriptExecutionTime = 0;
    for (let i = 0; i < entries.length; i++) {
        let fuelx = entries[i];
        if((fuelx.request.url.includes('fuelx.com') || fuelx.request.url.includes('fuel451.com')) && (fuelx.response.status === 200 || fuelx.response.status === 302)) {
            scriptExecutionTime += fuelx.time;
            console.log('FuelX URL: ', fuelx.request.url, ' Status Code: ', fuelx.response.status);
        }
        else if((fuelx.request.url.includes('fuelx.com') || fuelx.request.url.includes('fuel451.com')) && !fuelx.request.url.includes('favicon')) {
            if (fuelx.response.status !== 200 || fuelx.response.status !== 302) {
                console.log('Request URL ERROR: ', fuelx.request.url, 'Status Code: ', fuelx.response.status)
                return 'Pixel: Endpoint failure'
            }
        }
    }

    if(scriptExecutionTime > 5000) {
        console.log('Execution Time: ', scriptExecutionTime);
        return `Pixel: Execution ${scriptExecutionTime}`;
    } else if(scriptExecutionTime === 0) {
        return 'No Pixel';
    } else {
        console.log('Execution Time: ', scriptExecutionTime);
    }

    return false;
}

const callApi = async url => {
    try {
        const response = await axios.get(url, {auth: options.auth, headers: { 'Accept': 'application/json'}});
        return response.data;
    } catch (error) {
        console.log('callAPI Error')
    }
}

// const initApi = async () => {
//     await getBuild(options.url);
//     let newBuildId = buildId.splice(0,4)
//     for (let i = 0; i < newBuildId.length; i++) {
//         options.url = `${browserStackAPI}/${newBuildId[i]}.json`
//         sessionIdArr = await getSession(options.url);
//         getSessionData(sessionIdArr, newBuildId[i]);
//     }
//     console.log(failedSessions)
// }

const initApi = async () => {
    options.url = `${browserStackAPI}/${buildId}.json`;
    sessionIdArr = await getSession(options.url);
    getSessionData(sessionIdArr, buildId)
}

initApi();
