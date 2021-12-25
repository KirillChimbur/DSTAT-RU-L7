const express = require('express'),
	app = express(),
	http = require('http').createServer(app),
	io = require('socket.io')(http),
	path = require('path'),
	fs = require('fs')
var all_requests = 0,
	per_requests = 0

require('events').EventEmitter.defaultMaxListeners = Infinity

app.use(express.static(path.join(__dirname, 'assets/')))

app.get('/attack', (req, res) => {
	all_requests++
	per_requests++
	res.sendStatus(403)
})

setInterval(async() => {
	const config = await fs.readFileSync('stats.json', 'utf8')
	if(per_requests >= JSON.parse(config).max_requests) {
		fs.writeFileSync('stats.json', JSON.stringify({
			max_requests: per_requests
		}))
	}

	io.emit('requests', all_requests, per_requests, JSON.parse(config).max_requests)
	per_requests = 0
}, 1000)

setInterval(() => all_requests = 0, 1000 * 86400)

http.listen(80)
