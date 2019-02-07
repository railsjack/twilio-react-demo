require("dotenv").config();
var path = require("path");
var express = require("express");
var https = require('https');
var fs = require('fs')

var webpack = require("webpack");
var faker = require("faker");
var AccessToken = require("twilio").jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

var app = express();
console.log('process.env.NODE_ENV', process.env.NODE_ENV);
if(process.env.NODE_ENV === "DEV") { // Configuration for development environment
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    var webpackConfig = require("./webpack.config.js");
    const webpackCompiler = webpack(webpackConfig);
    app.use(webpackDevMiddleware(webpackCompiler, {
      hot: true
    }));
    app.use(webpackHotMiddleware(webpackCompiler));
    app.use(express.static(path.join(__dirname, "app")));
    console.log('log #1');
} else if(process.env.NODE_ENV === "PROD") { // Configuration for production environment
    app.use(express.static(path.join(__dirname, "dist")));
    console.log('log #2');
}

app.use(function(req, res, next){
    console.log('log #3');
    console.log("Request from: ", req.url);
    next();
})

// Endpoint to generate access token
app.get("/token", function(request, response) {

    var identity = faker.name.findName();
    

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created

    var token = new AccessToken(
        //process.env.TWILIO_ACCOUNT_SID,
        //process.env.TWILIO_API_KEY,
        //process.env.TWILIO_API_SECRET
        "ACd6a8336afa3d3e110b98f988c259ef20",
        "SKc38c2c63b542d25e61782aae7e19c25d",
        "xJFCRsBleEc36Kvk4uMdx6BEZC2GjBjC"
    );

    // Assign the generated identity to the token
    token.identity = identity;

    const grant = new VideoGrant();
   // Grant token access to the Video API features
   token.addGrant(grant);

   // Serialize the token to a JWT string and include it in a JSON response
   response.send({
       identity: identity,
       token: token.toJwt()
   });
});

var port = process.env.PORT || 3000;

https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app)
.listen(port, function () {
  console.log("Express server listening on *:" + port);
})

