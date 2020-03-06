var Movie = require('../models/movie');
var Producer = require('../models/producer');
var Genre = require('../models/genre');
var MovieInstance = require('../models/movieinstance');

const { body,validationResult } = require('express-validator/check');

const { sanitizeBody } = require('express-validator/filter');


var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        movie_count: function(callback) {
            Movie.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        movie_instance_count: function(callback) {
            MovieInstance.countDocuments({}, callback);
        },
        movie_instance_available_count: function(callback) {
            MovieInstance.countDocuments({status:'Available'}, callback);
        },
        producer_count: function(callback) {
            Producer.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Movie Home', error: err, data: results });
    });
};

// Display list of all movies.
exports.movie_list = function(req, res, next) {
    Movie.find({}, 'title producer')
        .populate('producer')
        .exec(function (err, list_movies) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('movie_list', { title: 'Movie List', movie_list: list_movies });
        });

};

// Display detail page for a specific movie.
exports.movie_detail = function(req, res, next) {

    async.parallel({
        movie: function(callback) {

            Movie.findById(req.params.id)
                .populate('producer')
                .populate('genre')
                .exec(callback);
        },
        movie_instance: function(callback) {

            MovieInstance.find({ 'movie': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.movie==null) { // No results.
            var err = new Error('Movie not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('movie_detail', { title: results.movie.title, movie: results.movie, movie_instances: results.movie_instance } );
    });

};


// Display movie create form on GET.
exports.movie_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our movie.
    async.parallel({
        producers: function(callback) {
            Producer.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('movie_form', { title: 'Create Movie', producers: results.producers, genres: results.genres });
    });

};

// Handle movie create on POST.
exports.movie_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    body('producer', 'Producer must not be empty.').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

    // Sanitize fields (using wildcard).
    sanitizeBody('*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var movie = new Movie(
            { title: req.body.title,
                producer: req.body.producer,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                producers: function(callback) {
                    Producer.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (movie.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('movie_form', { title: 'Create Movie',producers:results.producers, genres:results.genres, movie: movie, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            movie.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new book record.
                res.redirect(movie.url);
            });
        }
    }
];

// Display movie delete form on GET.
exports.movie_delete_get = function(req, res, next) {

    async.parallel({
        movie: function(callback) {
            Movie.findById(req.params.id).exec(callback)
        },
        movie_instances: function(callback) {
            MovieInstance.find({ 'movie': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.movie==null) { // No results.
            res.redirect('/catalog/movies');
        }
        // Successful, so render.
        res.render('movie_delete', { title: 'Delete Movie', movie: results.movie, movie_instance: results.movie_instances } );
    });

};
// Handle movie delete on POST.
exports.movie_delete_post = function(req, res, next) {

    async.parallel({
        movie: function(callback) {
            Movie.findById(req.body.movieid).exec(callback)
        },
        movie_instances: function(callback) {
            MovieInstance.find({ 'movie': req.body.movieid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.movie_instances.length > 0) {
            // Movie has movieinstances. Render in same way as for GET route.
            res.render('movie_delete', { title: 'Delete Movie',movie: results.movie, movie_instance: results.movie_instances } );
            return;
        }
        else {
            // Movie has no movieinstances. Delete object and redirect to the list of movies.
            Movie.findByIdAndRemove(req.body.movieid, function deleteMovie(err) {
                if (err) { return next(err); }
                // Success - go to movie list
                res.redirect('/catalog/movies')
            })
        }
    });
};

// Display movie update form on GET.
exports.movie_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        movie: function(callback) {
            Movie.findById(req.params.id).populate('producer').populate('genre').exec(callback);
        },
        producers: function(callback) {
            Producer.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.movie==null) { // No results.
            var err = new Error('Movie not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        // Mark our selected genres as checked.
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var movie_g_iter = 0; movie_g_iter < results.movie.genre.length; movie_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()==results.movie.genre[movie_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('movie_form', { title: 'Update Movie', producers: results.producers, genres: results.genres, movie: results.movie });
    });

};

// Handle movie update on POST.
exports.movie_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
                req.body.genre=[];
            else
                req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    body('producer', 'Producer must not be empty.').trim().isLength({ min: 1 }),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),

    // Sanitize fields.
    sanitizeBody('title').escape(),
    sanitizeBody('producer').escape(),
    sanitizeBody('summary').escape(),
    sanitizeBody('isbn').escape(),
    sanitizeBody('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var movie = new Movie(
            { title: req.body.title,
                producer: req.body.producer,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
                _id:req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                producers: function(callback) {
                    Producer.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (movie.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('movie_form', { title: 'Update Movie',producers: results.producers, genres: results.genres, movie: movie, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Movie.findByIdAndUpdate(req.params.id, movie, {}, function (err,themovie) {
                if (err) { return next(err); }
                // Successful - redirect to movie detail page.
                res.redirect(themovie.url);
            });
        }
    }
];