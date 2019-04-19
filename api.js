const axios = require('axios');
const username = 'leonwang3';
const password = 'JjxqP423VEJqACjztxWj';

let date = new Date().toString().slice(0, 15);

let browserStackAPI = `https://api.browserstack.com/automate/builds`,
    buildId,
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
        if (data[i].automation_build.name === date) {
            return data[i].automation_build.hashed_id;
        }
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


const getSessionData = async arr => {
    for (let i = 0; i < arr.length; i++) {
        try {
            const failDetails = {};
            sessionId = arr[i];
            options.url = `${browserStackAPI}/${buildId}/sessions/${sessionId}.json`
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
        } catch(e) {
            continue;
        }
    }
    console.log(failedSessions)
}

const getNetworkData = async url => {
    const data = await callApi(url)
    let entries = data.log.entries;
    let scriptExecutionTime = 0;
    for (let i = 0; i < entries.length; i++) {
        let fuelx = entries[i];
        if((fuelx.request.url.includes('fuel451') || fuelx.request.url.includes('fuelx')) && (fuelx.response.status === 200 || fuelx.response.status === 302)) {
            scriptExecutionTime += fuelx.time;
        }
        else if(fuelx.request.url.includes('fuel451') && (fuelx.response.status !== 200 || fuelx.response.status !== 302)) {
            console.log('Request URL', fuelx.request.url)
            console.log('Request status', fuelx.response.status)
            return 'Pixel: Endpoint failure'
        }
    }

    if(scriptExecutionTime > 5000) {
        console.log('Execution Time: ', scriptExecutionTime);
        scriptExecutionTime = 0;
        return 'Pixel: Execution too long';
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
        console.log('callAPI Error: ', error)
    }
}

const initApi = async () => {
    buildId = await getBuild(options.url);
    options.url = `${browserStackAPI}/${buildId}.json`
    sessionIdArr = await getSession(options.url);
    getSessionData(sessionIdArr);
}

initApi();
