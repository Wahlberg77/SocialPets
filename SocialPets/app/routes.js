// app/routes.js
module.exports = function (app, passport, server) {
    

    var multer = require('multer');
    var User = require('./models/user.js');
    var port = process.env.PORT || 8080;
    var io = require("socket.io").listen(server);


    var storage = multer.diskStorage({

            destination: function(req, file, cb) {
              cb(null, 'public/images/');
            },
                filename: function(req, file, cb) {
                  console.log(file.mimetype);
                  cb(null, Date.now() + '.jpg');
            }
  });

    var upload = multer();
    //var util = require.util();
    var multiparty = require('multiparty');
    //var router = express.Router;

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });
    
    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function (req, res) {
        
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });
    
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function (req, res) {
        
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    
    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user : req.user 
        });
        
    });

      app.post('/profile', upload.single('thumbnail'), isLoggedIn, function(req, res) {
        if (req.file) {
          var user = req.user;
            user.local.profileImage = req.file;
            user.save(function(err) {
                res.render('profile', { title: 'Image was uploaded', user : req.user});
          });
        };
    });
    
    app.get('/friends', isLoggedIn, function (req, res) {
        res.render('friends.ejs', {
            user : req.user
        });
    });
    
    app.post('/friends', upload.single('thumbnail'), isLoggedIn, function (req, res) {
        if (req.file) {
            var user = req.user;
            user.local.friends = req.file;
            user.save(function (err) {
                res.render('friends', { title: 'Image was uploaded', user : req.user });
            });
        };
    });
    
    app.get('/chat', isLoggedIn, function (req, res) {
        res.render('chat.ejs', {
            user : req.user
        });
    });
   
    // =====================================
    // PROFILE EDIT =======================
    // =====================================

  app.get('/edit', isLoggedIn, function(req, res) {
        res.render('edit.ejs', {
            user : req.user
        });
    });

    app.post('/edit', isLoggedIn, function (req, res) {
        User.findById(req.user._id, function (err, user) {
            if (err) { throw err }
            user.local.userName = req.body.userName;
            user.local.food = req.body.food;
            user.local.funnyFacts = req.body.funnyFacts;
            user.local.birth = req.body.birth;
            user.save(function (err) {
                if (err) { throw err }
                res.render('edit', { title: 'Information saved' });
          
            //successRedirect : '/profile' // redirect to the secure profile section
            })
            res.redirect('/profile')
        });
    });

    // =====================================
    // CHAT  ===============================
    // =====================================
    io.sockets.on("connection", function (socket) {
        socket.emit("message", { message: "...." });
        socket.on("send", function (data) {
            io.sockets.emit("message", data);
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
    
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    
    // if they aren't redirect them to the home page
    res.redirect('/');
}