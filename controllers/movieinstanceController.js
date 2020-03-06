var MovieInstance = require('../models/movieinstance');

const { body,validationResult } = require('express-validator/check');

const { sanitizeBody } = require('express-validator/filter');

var Movie = require('../models/movie');

var async = require('async');

// Display list of all MovieInstances.
exports.movieinstance_list = function(req, res, next) {

    MovieInstance.find()
        .populate('movie')
        .exec(function (err, list_movieinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('movieinstance_list', { title: 'Movie Instance List', movieinstance_list: list_movieinstances });
        });

};
// Display detail page for a specific MovieInstance.
exports.movieinstance_detail = function(req, res, next) {

    MovieInstance.findById(req.params.id)
        .populate('movie')
        .exec(function (err, movieinstance) {
            if (err) { return next(err); }
            if (movieinstance==null) { // No results.
                var err = new Error('Movie copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render.
            res.render('movieinstance_detail', { title: 'Copy: '+movieinstance.movie.title, movieinstance:  movieinstance});
        })

};
// Display MovieInstance create form on GET.
exports.movieinstance_create_get = function(req, res, next) {

    Movie.find({},'title')
        .exec(function (err, movies) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('movieinstance_form', {title: 'Create MovieInstance', movie_list: movies});
        });

};
// Handle MovieInstance create on POST.
exports.movieinstance_create_post = [

    // Validate fields.
    body('movie', 'Movie must be specified').trim().isLength({ min: 1 }),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('movie').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var movieinstance = new MovieInstance(
            { movie: req.body.movie,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Movie.find({},'title')
                .exec(function (err, movies) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('movieinstance_form', { title: 'Create MovieInstance', movie_list: movies, selected_movie: movieinstance.movie._id , errors: errors.array(), movieinstance: movieinstance });
                });
            return;
        }
        else {
            // Data from form is valid.
            movieinstance.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new record.
                res.redirect(movieinstance.url);
            });
        }
    }
];

// Display MovieInstance delete form on GET.
exports.movieinstance_delete_get = function(req, res, next) {
    MovieInstance.findById(req.params.id)
        .populate('movie')
        .exec(function(err, movieinstance) {
        if (err) { return next(err); }
        if (movieinstance==null) { // No results.
             res.redirect('/catalog/movieinstances');
         }
        res.render('movieinstance_delete', { title: 'Delete MovieInstance', movieinstance: movieinstance} );

        // Successful, so render.

    });

};



// Handle MovieInstance delete on POST.
exports.movieinstance_delete_post = function(req, res, next) {

    // Assume valid MovieInstance id in field.
    MovieInstance.findByIdAndRemove(req.body.id, function deleteMovieInstance(err) {
        if (err) { return next(err); }
        // Success, so redirect to list of MovieInstance items.
        res.redirect('/catalog/movieinstances');
    });

};
// Display MovieInstance update form on GET.
exports.movieinstance_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        movieinstance: function(callback) {
            MovieInstance.findById(req.params.id).populate('movie').exec(callback)
        },
        movies: function(callback) {
            Movie.find(callback)
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.movieinstance==null) { // No results.
            var err = new Error('Movie copy not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('movieinstance_form', { title: 'Update  MovieInstance', movie_list : results.movies, selected_movie : results.movieinstance.movie._id, movieinstance:results.movieinstance });
    });

};

// Handle movieinstance update on POST.
exports.movieinstance_update_post = [

    // Validate fields.
    body('movie', 'Book must be specified').isLength({ min: 1 }).trim(),
    body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('movie').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').escape(),
    sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a MovieInstance object with escaped/trimmed data and current id.
        var movieinstance = new MovieInstance(
            { movie: req.body.movie,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back,
                _id: req.params.id
            });

        if (!errors.isEmpty()) {
            // There are errors so render the form again, passing sanitized values and errors.
            Movie.find({},'title')
                .exec(function (err, movies) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('movieinstance_form', { title: 'Update MovieInstance', movie_list : movies, selected_movie : movieinstance.movie._id , errors: errors.array(), movieinstance:movieinstance });
                });
            return;
        }
        else {
            // Data from form is valid.
            MovieInstance.findByIdAndUpdate(req.params.id, movieinstance, {}, function (err,themovieinstance) {
                if (err) { return next(err); }
                // Successful - redirect to detail page.
                res.redirect(themovieinstance.url);
            });
        }
    }
];

