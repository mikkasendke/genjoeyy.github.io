const https = require('https')
const express = require('express')
const app = express()
const port = process.env.PORT || 6969
const fs = require('fs')
const cheerio = require('cheerio')
const cron = require('node-cron')
const moment = require('moment')
const path = require('path')

const privateKey = fs.readFileSync(path.join(__dirname, 'sslcert', 'private.key'), 'utf8');
const certificate = fs.readFileSync(path.join(_dirname, 'sslcert', 'certificate.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpsServer = https.createServer(credentials, app);

function isValidChannel(channel) {
    const channels = ['#stegi', '#di1araas']
    if (channels.includes(channel)) {
        return true
    }
    return false
}

function gitCommit(message) {
    require('child_process').execFile('git', ['add', '-A'])
    require('child_process').execFile('git', ['commit', '-m', message])
    require('child_process').execFile('git', ['push', '-u', 'origin', 'main'])
}

function appendMessage(chatContainerSelector, chatMessageHTML) {
    try {
        const htmlFilePath = './index.html'
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8')
        const $ = cheerio.load(htmlContent)
        const chatContainer = $(chatContainerSelector)
        chatContainer.append(chatMessageHTML)
        fs.writeFileSync(htmlFilePath, $.html(), 'utf8')
        gitCommit('added message')
    } catch (err) {
        throw err
    }
}

function appendDateMessage(date) {
    const dateMessage = `
    <div class="chat-message">
        <span class="chat-timestamp">${date}</span>
    </div>
    `
    try {
        appendMessage('.chat-scrollable-stegi', dateMessage)
        appendMessage('.chat-scrollable-di1araas', dateMessage)
    } catch (err) {
        console.error(`Error appending date message (${date}):`, err);
    }
}

cron.schedule('0 0 * * *', () => {
    console.log('Appending date message...');
    const time = moment().locale("de").format('LT')
    const weekday = moment().locale("de").format('dddd').toString()
    const fullDate = moment().locale("de").format('LL').toString()

    appendDateMessage(`${time} ${weekday}, ${fullDate}`);
}, {
    timezone: 'Europe/Berlin'
});

httpsServer.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
httpsServer.get('/cname', (req, res) => {
    res.sendFile(path.join(__dirname, 'CNAME'))
})

httpsServer.post('/api/send', express.json(), (req, res) => {
    let { channel, time, username, message } = req.body
    console.log(channel)
    console.log(time)
    console.log(username)
    console.log(message)
    if (!channel || !time || !username || !message) {
        res.json({ error: 'channel, time, username, message must be defined' })
        return
    }
    if (!isValidChannel(channel)) {
        res.json({ error: 'invalid channel' })
        return
    }
    channel = channel.substring(1)

    const chatContainerSelector = '.chat-scrollable-' + channel
    const chatMessageHTML = `
        <div class="chat-message">
        <span class="chat-timestamp">${time}</span>
        <span class="chat-username chat-username-${username}">${username}:</span>
        <span class="chat-text">${message}</span>
        </div>
        `

    try {
        appendMessage(chatContainerSelector, chatMessageHTML)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
        return
    }
    res.status(200).json({ message: 'Message added successfully' })
});

httpsServer.delete('/api/delete', (req, res) => {
    let { channel } = req.body
    if (!isValidChannel(channel)) {
        res.json({ error: 'invalid channel' })
        return
    }
    const chatContainerSelector = '.chat-scrollable-' + channel.substring(1)
    try {
        const filePath = './index.html'
        let htmlContent = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(htmlContent);

        const chatContainer = $(chatContainerSelector);
        if (chatContainer.length > 0) {
            const lastMessage = chatContainer.find('.chat-message').last();
            if (lastMessage.length > 0 && lastMessage.find(".chat-text").length > 0) {
                lastMessage.remove();
                fs.writeFileSync(filePath, $.html(), 'utf8');
                gitCommit('deleted message')
                res.status(200).json({ message: 'Latest message deleted successfully' })
            } else {
                res.status(404).json({ error: 'No messages found in the chat container' })
            }
        } else {
            res.status(404).json({ error: 'Chat container not found' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})



httpsServer.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
