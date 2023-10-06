const https = require('https')
const express = require('express')
const app = express()
const port = process.env.PORT || 6969
const fs = require('fs')
const cheerio = require('cheerio')
const cron = require('node-cron')
const moment = require('moment')
const path = require('path')
const socketIO = require('socket.io')

const tmi = require('tmi.js')
const config = require('./op.json')

app.use(express.static(__dirname + "/public"))
app.use(express.static(__dirname + "/files"))

const privateKey = fs.readFileSync(path.join(__dirname, 'sslcert', 'private.key'), 'utf8');
const certificate = fs.readFileSync(path.join(__dirname, 'sslcert', 'certificate.crt'), 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

const io = socketIO(httpsServer)

let viewerCount = 0;
io.on('connection', (socket) => {
    viewerCount++
    io.emit('viewerCount', viewerCount);

    socket.on('disconnect', () => {
        viewerCount--
        io.emit('viewerCount', viewerCount);
    });
});

const users_to_log = ["stegi", "di1araas"]
const trusted_users = ["genjoeyy", "sukunant", "lars_cg", "admiralbear", "nraquu", "causeimerik", "xpeepohappy", "zfdarius"]
const channels = ['stegi', 'di1araas']
const options = {
    identity: {
        username: config['bot_username'], password: config['bot_token'],
    }, channels: channels,
}
const client = new tmi.Client(options)

try {
    client.on("message", (channel, userstate, message) => {
        let log_message = `${console_time()} ${channel} @${userstate.username}: ${message}`
        if (users_to_log.includes(userstate.username)) {
            console.log(log_message)

            const time = console_time();
            const username = userstate.username
            channel = channel.substring(1)
            const chatContainerSelector = '.chat-scrollable-' + channel
            const chatMessageHTML = `
            <div class="chat-message">
                <span class="chat-timestamp">${time}</span>
                <span class="chat-username chat-username-${username}">${username}:</span>
                <span class="chat-text">${message}</span>
            </div>
            `
            appendMessage(chatContainerSelector, chatMessageHTML)

        } else if (trusted_users.includes(userstate.username)) {
            let ping_pattern = /@?fu?ckfomo\s+(check\s*)+/i
            if (ping_pattern.test(message)) {
                client.say(channel, "check check komme mitm jetpack")
            }
        }
    })
} catch (err) {
    console.error(err)
}


function console_time() {
    return moment().locale("de").format('LT')
}


function isValidChannel(channel) {
    const channels = ['#stegi', '#di1araas']
    if (channels.includes(channel)) {
        return true
    }
    return false
}

function appendMessage(chatContainerSelector, chatMessageHTML) {
    try {
        const htmlFilePath = path.join(__dirname, 'index.html')
        const htmlContent = fs.readFileSync(htmlFilePath, 'utf8')
        const $ = cheerio.load(htmlContent)
        const chatContainer = $(chatContainerSelector)
        chatContainer.append(chatMessageHTML)
        fs.writeFileSync(htmlFilePath, $.html(), 'utf8')
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
    const time = console_time()
    const weekday = moment().locale("de").format('dddd').toString()
    const fullDate = moment().locale("de").format('LL').toString()

    appendDateMessage(`${time} ${weekday}, ${fullDate}`);
}, {
    timezone: 'Europe/Berlin'
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})
app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(path.join('socket.io'))
})

app.post('/api/send', express.json(), (req, res) => {
    let { channel, time, username, message } = req.body
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
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
        return
    }
    res.status(200).json({ message: 'Message added successfully' })
});

app.delete('/api/delete', (req, res) => {
    let { channel } = req.body
    if (!isValidChannel(channel)) {
        res.json({ error: 'invalid channel' })
        return
    }
    const chatContainerSelector = '.chat-scrollable-' + channel.substring(1)
    try {
        const filePath = path.join(__dirname, 'index.html')
        let htmlContent = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(htmlContent);

        const chatContainer = $(chatContainerSelector);
        if (chatContainer.length > 0) {
            const lastMessage = chatContainer.find('.chat-message').last();
            if (lastMessage.length > 0 && lastMessage.find(".chat-text").length > 0) {
                lastMessage.remove();
                fs.writeFileSync(filePath, $.html(), 'utf8');
                res.status(200).json({ message: 'Latest message deleted successfully' })
            } else {
                res.status(404).json({ error: 'No messages found in the chat container' })
            }
        } else {
            res.status(404).json({ error: 'Chat container not found' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Internal server error' })
    }
})



client.on("connected", () => {
    console.log(`-- tmi client connected to ${channels} `)
})
httpsServer.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
client.connect()
