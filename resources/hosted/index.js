var express = require('express')
var app = express()


app.use((error, req, res, next) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || 'gdfgfdgdfgdfgdfgdfgdfgdfgdfg',
      },
    });
  });
  
app.get('/', function(req, res) {

      
    res.status(200).json({
        hello: "Hello World!"
    })
})

app.get('/hello/:name', function(req, res) {
    var name = req.params.name
    res.status(400)
    res.json({
     
        hello: "hello " + name
    })
})


app.get('/hola/:name', function(req, res) {
    res.status(200)
console.info({headers:req.headers})
 res.sendFile('./package.json', { root: __dirname });
})

var server = app.listen(process.env.PORT || 9000, function() {
    console.log('Listening on port %d', server.address().port)
})