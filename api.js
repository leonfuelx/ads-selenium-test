const axios = require('axios');
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;

const username = 'leonwang3';
const password = 'JjxqP423VEJqACjztxWj';

// new CronJob('* * * * * *', function() {
    
    let date = new Date().toString().slice(0, 15);

    let browserStackAPI = `https://api.browserstack.com/automate/builds`,
        buildId,
        sessionId,
        networkLogs,
        client,
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
                networkLogs = `${data.automation_session.browser_url}/networklogs`
                console.log('SESSIONID', sessionId)
                let status = await getNetworkData(networkLogs);
        
                if (status) {
                    failDetails[client] = {
                        [sessionId]: status
                    };
                    failedSessions.push(failDetails);
                }
                
                options.url = '';
            } catch(e) {
                continue;
            }
        }
        if (!failedSessions.length) {
            console.log(date, ': All Passed!')
        } else {
            console.log(date, failedSessions)
        }
    }
    
    const getNetworkData = async url => {
        const data = await callApi(url)
        let entries = data.log.entries;
            client = entries[0].request.url;
        let scriptExecutionTime = 0;
        for (let i = 0; i < entries.length; i++) {
            let fuelx = entries[i];
            if((fuelx.request.url.includes('fuel451.com') || fuelx.request.url.includes('fuelx.com')) && (fuelx.response.status === 200 || fuelx.response.status === 302)) {
                console.log(fuelx.request.url)
                scriptExecutionTime += fuelx.time;
            }
            else if((fuelx.request.url.includes('fuel451.com') || fuelx.request.url.includes('fuelx.com')) && (fuelx.response.status !== 200 || fuelx.response.status !== 302) && !fuelx.request.url.includes('favicon')) {
                console.log('Request URL', fuelx.request.url)
                console.log('Request status', fuelx.response.status)
                return `Pixel: Endpoint failure (URL:${fuelx.request.url}, STATUS:${fuelx.response.status})`
            }
        }
    
        if(scriptExecutionTime > 3000) {
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
    
    const sendMessage = async (body) => {
        let message = {
            from:'leon.wang@fuelx.com',
            to:['leon.wang@fuelx.com', 'pradeep@fuelx.com'],
            subject: `${date} Pixel Check Issues`,
            html: `<p>${JSON.stringify(body)}</p>`
        }
    
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'leon.wang@fuelx.com',
                pass: 'kgxxfarkeueljzsb'
            } 
        });
    
        transporter.sendMail(message, function(err, info) {
            if(err)
                console.log(err);
            else
                console.log(info);
        })
    }
    
    const initApi = async () => {
        buildId = await getBuild(options.url);
        options.url = `${browserStackAPI}/${buildId}.json`
        sessionIdArr = await getSession(options.url);
        await getSessionData(sessionIdArr);
        sendMessage(failedSessions);
    }
    
    initApi();
    
// }, null, true, 'America/Los_Angeles');

