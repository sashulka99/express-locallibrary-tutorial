var Producer = require('../models/producer');

var async = require('async');

var Movie = require('../models/movie');

const { body,validationResult } = require('express-validator/check');

const { sanitizeBody } = require('express-validator/filter');

// Display list of all Producers.
exports.producer_list = function(req, res, next)  {

    Producer.find()
        .populate('producer')
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_producers) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('producer_list', { title: 'Producer List', producer_list: list_producers });
        });

};

// Display detail page for a specific Producer.
exports.producer_detail = function(req, res, next) {

    async.parallel({
        producer: function(callback) {
            Producer.findById(req.params.id)
                .exec(callback)
        },
        producers_movies: function(callback) {
            Movie.find({ 'producer': req.params.id },'title summary')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.producer==null) { // No results.
            var err = new Error('Producer not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('producer_detail', { title: 'Producer Detail',producer: results.producer, producer_movies: results.producers_movies } );
    });

};

// Display Producer create form on GET.
exports.producer_create_get = function(req, res, next) {
    res.render('producer_form', { title: 'Create Producer'});
};

// Handle Producer create on POST.
exports.producer_create_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
    body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
    body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('first_name').escape(),
    sanitizeBody('family_name').escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('producer_form', { title: 'Create Producer',producer: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create an Producer object with escaped and trimmed data.
            var producer = new Producer(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death
                });
            producer.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new producer record.
                res.redirect(producer.url);
            });
        }
    }
];
// Display Producer delete form on GET.
exports.producer_delete_get = function(req, res, next) {

    async.parallel({
        producer: function(callback) {
            Producer.findById(req.params.id).exec(callback)
        },
        producers_movies: function(callback) {
            Movie.find({ 'producer': req.params.id }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.producer==null) { // No results.
            res.redirect('/catalog/producers');
        }
        // Successful, so render.
        res.render('producer_delete', { title: 'Delete Producer', producer: results.producer, producer_movies: results.producers_movies } );
    });

};

// Handle Producer delete on POST.
exports.producer_delete_post = function(req, res, next) {

    async.parallel({
        producer: function(callback) {
            Producer.findById(req.body.producerid).exec(callback)
        },
        producers_movies: function(callback) {
            Movie.find({ 'producer': req.body.producerid }).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.producers_movies.length > 0) {
            // Producer has movies. Render in same way as for GET route.
            res.render('producer_delete', { title: 'Delete Producer',producer: results.producer, producer_movies: results.producers_movies } );
            return;
        }
        else {
            // Producer has no movies. Delete object and redirect to the list of producers.
            Producer.findByIdAndRemove(req.body.producerid, function deleteProducer(err) {
                if (err) { return next(err); }
                // Success - go to producer list
                res.redirect('/catalog/producers')
            })
        }
    });
};

// Display Producer update form on GET.
exports.producer_update_get = function (req, res, next) {

    Producer.findById(req.params.id, function (err, producer) {
        if (err) { return next(err); }
        if (producer == null) { // No results.
            var err = new Error('Producer not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        res.render('producer_form', { title: 'Update Producer',producer: producer });

    });
};
// Handle Producer update on POST.
exports.producer_update_post = [

    // Validate fields.
    body('first_name').isLength({ min: 1 }).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
        body('family_name').isLength({ min: 1 }).trim().withMessage('Family name must be specified.')
            .isAlphanumeric().withMessage('Family name has non-alphanumeric characters.'),
        body('date_of_birth', 'Invalid date of birth').optional({ checkFalsy: true }).isISO8601(),
        body('date_of_death', 'Invalid date of death').optional({ checkFalsy: true }).isISO8601(),

        // Sanitize fields.
        sanitizeBody('first_name').escape(),
        sanitizeBody('family_name').escape(),
        sanitizeBody('date_of_birth').toDate(),
        sanitizeBody('date_of_death').toDate(),

        // Process request after validation and sanitization.
        (req, res, next) => {

            // Extract the validation errors from a request.
            const errors = validationResult(req);

            // Create Producer object with escaped and trimmed data (and the old id!)
            var producer = new Producer(
                {
                    first_name: req.body.first_name,
                    family_name: req.body.family_name,
                    date_of_birth: req.body.date_of_birth,
                    date_of_death: req.body.date_of_death,
                    _id: req.params.id
                }
            );

            if (!errors.isEmpty()) {
                // There are errors. Render the form again with sanitized values and error messages.
                res.render('producer_form', { title: 'Update Producer', producer: producer, errors: errors.array() });
                return;
            }
            else {
                // Data from form is valid. Update the record.
                Producer.findByIdAndUpdate(req.params.id, producer, {}, function (err, theproducer) {
                    if (err) { return next(err); }
                    // Successful - redirect to producer detail page.
                    res.redirect(theproducer.url);
                });
            }
        }
    ];