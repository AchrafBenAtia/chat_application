var express = require('express');
var router = express.Router();
var fs = require('fs');

var isAuthenticated = function(req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

module.exports = function(passport) {

	/* GET login page. */
	router.get('/', function(req, res) {
		// Display the Login page with any flash message, if any
		res.render('index.html', {
			message: req.flash('message')
		});
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash: true
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res) {
			res.render('register.html', {
			message: req.flash('message')
		});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res) {
		res.render('home.html', {
			user: req.user
		});
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	router.get('/*', function(req, res) {
		res.redirect('/home');
	});

	//upload file and add path to MongoDB 

	router.post('/file-upload', function(req, res, next) {
		console.log(JSON.stringify(req.files.file));
	/*	console.log(req.body.data);
		console.log(req.user.username);*/
		data = req.files.file;
		res.send(data);
	});



	return router;
}