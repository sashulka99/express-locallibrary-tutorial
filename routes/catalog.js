var express = require('express');
var router = express.Router();

// Require controller modules.
var movie_controller = require('../controllers/movieController');
var producer_controller = require('../controllers/producerController');
var genre_controller = require('../controllers/genreController');
var movie_instance_controller = require('../controllers/movieinstanceController');

/// MOVIE ROUTES ///

// GET catalog home page.
router.get('/', movie_controller.index);

// GET request for creating a Movie. NOTE This must come before routes that display Movie (uses id).
router.get('/movie/create', movie_controller.movie_create_get);

// POST request for creating Movie.
router.post('/movie/create', movie_controller.movie_create_post);

// GET request to delete Movie.
router.get('/movie/:id/delete', movie_controller.movie_delete_get);

// POST request to delete Movie.
router.post('/movie/:id/delete', movie_controller.movie_delete_post);

// GET request to update Movie.
router.get('/movie/:id/update', movie_controller.movie_update_get);

// POST request to update Movie.
router.post('/movie/:id/update', movie_controller.movie_update_post);

// GET request for one Book.
router.get('/movie/:id', movie_controller.movie_detail);

// GET request for list of all Book items.
router.get('/movies', movie_controller.movie_list);

/// PRODUCER ROUTES ///

// GET request for creating Producer. NOTE This must come before route for id (i.e. display producer).
router.get('/producer/create', producer_controller.producer_create_get);

// POST request for creating Producer.
router.post('/producer/create', producer_controller.producer_create_post);

// GET request to delete Producer.
router.get('/producer/:id/delete', producer_controller.producer_delete_get);

// POST request to delete Producer.
router.post('/producer/:id/delete', producer_controller.producer_delete_post);

// GET request to update Producer.
router.get('/producer/:id/update', producer_controller.producer_update_get);

// POST request to update Producer.
router.post('/producer/:id/update', producer_controller.producer_update_post);

// GET request for one Producer.
router.get('/producer/:id', producer_controller.producer_detail);

// GET request for list of all Producers.
router.get('/producers', producer_controller.producer_list);

/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

//POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);

/// MOVIEINSTANCE ROUTES ///

// GET request for creating a MovieInstance. NOTE This must come before route that displays MovieInstance (uses id).
router.get('/movieinstance/create', movie_instance_controller.movieinstance_create_get);

// POST request for creating MovieInstance.
router.post('/movieinstance/create', movie_instance_controller.movieinstance_create_post);

// GET request to delete MovieInstance.
router.get('/movieinstance/:id/delete', movie_instance_controller.movieinstance_delete_get);

// POST request to delete MovieInstance.
router.post('/movieinstance/:id/delete', movie_instance_controller.movieinstance_delete_post);

// GET request to update MovieInstance.
router.get('/movieinstance/:id/update', movie_instance_controller.movieinstance_update_get);

// POST request to update MovieInstance.
router.post('/movieinstance/:id/update', movie_instance_controller.movieinstance_update_post);

// GET request for one MovieInstance.
router.get('/movieinstance/:id', movie_instance_controller.movieinstance_detail);

// GET request for list of all MovieInstance.
router.get('/movieinstances', movie_instance_controller.movieinstance_list);

module.exports = router;