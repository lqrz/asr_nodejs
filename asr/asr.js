// ## Middleware
// Express is a routing and middleware web framework that has minimal functionality of its own
// Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. The next middleware function is commonly denoted by a variable named next.
// If the current middleware function does not end the request-response cycle, it must call next()
// middleware funcs are set at application level using app.set() app.use(), app.get(), app.post()

// ## Error handling
// Error handling middleware funcs are the same as any other, but their prototype is different
// they have four params instead of three (err, req, res, next)

// ## Templates
// A template engine enables you to use static template files in your application. At runtime, the template engine replaces variables in a template file with actual values, and transforms the template into an HTML file sent to the client. This approach makes it easier to design an HTML page.
// To render template files you need to set the 'views' and 'view engine' params using app.set()

var express = require('express')
var stylus = require('stylus')
var nib = require('nib')

var bodyParser = require('body-parser')

var exec = require('child_process').exec;

var fs = require('fs');
var path = require('path')

var app = express()
var router =  express.Router()

function compile(str, path){
	return stylus(str)
		.set('filename', path)
		.use(nib())
}

app.set('views', __dirname + '')
app.set('view engine', 'pug') // i dont have to load pug myself if i do this.
app.use(stylus.middleware(
	{
		src: __dirname + '/public',
		compile: compile
	}
	))
app.use(express.static(__dirname + '/public'))

app.use(bodyParser.json({limit: '50mb'}));
// app.use(express.json())

// to match route params: app.get('/users/:userId/books/:bookId', function (req, res) {

router.get('/', function(req, res){
	// res.send('about') //just send the string 'about'
	res.render('index', {title: 'Hi there', message: 'Gatito'})
})

function exec_bash(audio, audio_path, decoder_path, res){
	file_path = audio_path + "test_file.wav"
	console.log("Audio filepath:" + file_path)
	fs.writeFile(file_path, audio, function(err){
		if (err)
			console.log(err);
	})

	console.log("Playing the recorded audio")
	exec('aplay ' + file_path, function(err, stdout, stderr){
		console.log(stdout)
	})

	console.log("Running the decoder: " + './' + path.basename(decoder_path) + ' ' + file_path + ' ' + path.dirname(file_path))
	exec('./' + path.basename(decoder_path) + ' ' + file_path + ' ' + path.dirname(file_path), {cwd: path.dirname(decoder_path)}, function(err, stdout, stderr){
		if (err)
			console.log(err);
		translation_file = path.dirname(file_path) + '/' + '1Best.txt'

		// exec('cat  ' + translation_file + ' | sed -En "s/\(.*\)//p"', function(err,stdout,stderr){
		exec('cat  ' + translation_file, function(err,stdout,stderr){
			if (err)
				console.log(err);
			// TODO sed the stats
			console.log(stdout)
			res.send(JSON.stringify({'status': 'success', 'translation': stdout})) 
		})
	})
}

router.post('/send_audio', function(req, res){
	// console.log(req.body.audio_base64)
  	var client_audio = new Buffer(req.body.audio_base64, 'base64'); // decode
	console.log('Audio received')
	console.log(client_audio)
	exec_bash(client_audio, req.body.audio_path, req.body.decoder_path, res)
})

app.use('/',router);

app.use('*',function(req,res){
  res.render('404');
});

app.listen(3000)
console.log('App listening at 3000')