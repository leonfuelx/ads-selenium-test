const axios = require('axios');
const username = 'leonwang3';
const password = 'JjxqP423VEJqACjztxWj';

let date = new Date().toString().slice(0, 15)

let browserStackAPI = `https://api.browserstack.com/automate/builds`,
    buildId,
    sessionId,
    networkLogs,
    consoleLogs,
    logs

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
        sessionId = arr[i];
        options.url = `${browserStackAPI}/${buildId}/sessions/${sessionId}.json`
        let data = await callApi(options.url);
        // console.log('DATA', data)
        logs = data.automation_session.logs;
        consoleLogs = data.automation_session.browser_console_logs_url;
        networkLogs = `${data.automation_session.browser_url}/networklogs`
        // networkLogs = data.automation_session.har_logs_url
        // console.log(networkLogs)
        console.log('SESSIONID', sessionId)
        await   (networkLogs)
        // console.log(consoleLogs)
        // console.log(networkLogs)
        // console.log('---------------------------------')
        options.url = '';
    }
}

const getNetworkData = async url => {
    const data = await callApi(url)
    let entries = data.log.entries;
    for (let i = 0; i < entries.length; i++) {
        if(entries[i].request.url.includes('fuel451')) {
            console.log(entries[i].request.url)
        }
    }
    console.log('----------------------------------------------------------')
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
