const axios = require('axios');
const nodemailer = require('nodemailer');
const CronJob = require('cron').CronJob;

const username = 'leonwang3';
const password = 'JjxqP423VEJqACjztxWj';

new CronJob('0 30 18 * * *', function() {
    
    let date = new Date().toString().slice(0, 15);

    let browserStackAPI = `https://api.browserstack.com/automate/builds`,
        buildId,
        sessionId,
        networkLogs,
        client,
        failedSessions = '';
    
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
        sessionArr = [];
        let data = await callApi(url);
            data = data.build.sessions;
        for (let i = 0; i < data.length; i++) {
            sessionArr.push(data[i].automation_session.hashed_id);
        }
        return sessionArr;
    } 
    
    
    const getSessionData = async arr => {
        for (let i = 0; i < arr.length; i++) {
            try {
                sessionId = arr[i];
                options.url = `${browserStackAPI}/${buildId}/sessions/${sessionId}.json`
                let data = await callApi(options.url);
                networkLogs = `${data.automation_session.browser_url}/networklogs`
                let status = await getNetworkData(networkLogs);
        
                if (status) {
                    failedSessions+=`<br>${client}: ${status}`
                }
                
                options.url = '';
            } catch(e) {
                continue;
            }
        }
        if (!failedSessions.length) {
            sendMessage('All Clients Passed!')
        } else {
            sendMessage(failedSessions)
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
                return `Pixel: Endpoint failure (URL:${fuelx.request.url}, STATUS:${fuelx.response.status}) (${sessionId})`
            }
        }
    
        if(scriptExecutionTime > 3000) {
            return `Pixel: Execution took ${scriptExecutionTime}ms (${sessionId})`;
        } else if(scriptExecutionTime === 0) {
            return `No Pixel (${sessionId})`;
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
            to:['leon.wang@fuelx.com'],
            subject: `${date} Pixel Check Issues`,
            html: `<p>${body}</p>`
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
    }
    
    initApi();
    
}, null, true, 'America/Los_Angeles');

