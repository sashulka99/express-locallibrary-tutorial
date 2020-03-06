#! /usr/bin/env node

console.log('This script populates some test movies, producers, genres and filminstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Movie = require('./models/movie')
var Producer = require('./models/producer')
var Genre = require('./models/genre')
var MovieInstance = require('./models/movieinstance')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var producers = []
var genres = []
var movies = []
var movieinstances = []

function producerCreate(first_name, family_name, d_birth, d_death, cb) {
    producerdetail = {first_name:first_name , family_name: family_name }
    if (d_birth != false) producerdetail.date_of_birth = d_birth
    if (d_death != false) producerdetail.date_of_death = d_death

    var producer = new Producer(producerdetail);

    producer.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Producer: ' + producer);
        producers.push(producer)
        cb(null, producer)
    }  );
}

function genreCreate(name, cb) {
    var genre = new Genre({ name: name });

    genre.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Genre: ' + genre);
        genres.push(genre)
        cb(null, genre);
    }   );
}

function movieCreate(title, summary, isbn, producer, genre, cb) {
    moviedetail = {
        title: title,
        summary: summary,
        producer: producer,
        isbn: isbn
    }
    if (genre != false) moviedetail.genre = genre

    var movie = new Movie(moviedetail);
    movie.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('New Movie: ' + movie);
        movies.push(movie)
        cb(null, movie)
    }  );
}


function movieInstanceCreate(movie, imprint, due_back, status, cb) {
    movieinstancedetail = {
        movie: movie,
        imprint: imprint
    }
    if (due_back != false) movieinstancedetail.due_back = due_back
    if (status != false) movieinstancedetail.status = status

    var movieinstance = new MovieInstance(movieinstancedetail);
    movieinstance.save(function (err) {
        if (err) {
            console.log('ERROR CREATING MovieInstance: ' + movieinstance);
            cb(err, null)
            return
        }
        console.log('New MovieInstance: ' + movieinstance);
        movieinstances.push(movieinstance)
        cb(null, movie)
    }  );
}


function createGenreProducers(cb) {
    async.series([
            function(callback) {
                producerCreate('Patrick', 'Rothfuss', '1973-06-06', false, callback);
            },
            function(callback) {
                producerCreate('Ben', 'Bova', '1932-11-8', false, callback);
            },
            function(callback) {
                producerCreate('Isaac', 'Asimov', '1920-01-02', '1992-04-06', callback);
            },
            function(callback) {
                producerCreate('Bob', 'Billings', false, false, callback);
            },
            function(callback) {
                producerCreate('Jim', 'Jones', '1971-12-16', false, callback);
            },
            function(callback) {
                genreCreate("Fantasy", callback);
            },
            function(callback) {
                genreCreate("Science Fiction", callback);
            },
            function(callback) {
                genreCreate("French Poetry", callback);
            },
        ],
        // optional callback
        cb);
}


function createMovies(cb) {
    async.parallel([
            function(callback) {
                movieCreate('The Name of the Wind (The Kingkiller Chronicle, #1)', 'I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.', '9781473211896', producers[0], [genres[0],], callback);
            },
            function(callback) {
                movieCreate("The Wise Man's Fear (The Kingkiller Chronicle, #2)", 'Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.', '9788401352836', producers[0], [genres[0],], callback);
            },
            function(callback) {
                movieCreate("The Slow Regard of Silent Things (Kingkiller Chronicle)", 'Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.', '9780756411336', producers[0], [genres[0],], callback);
            },
            function(callback) {
                movieCreate("Apes and Angels", "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...", '9780765379528', producers[1], [genres[1],], callback);
            },
            function(callback) {
                movieCreate("Death Wave","In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...", '9780765379504', producers[1], [genres[1],], callback);
            },
            function(callback) {
                movieCreate('Test Movie 1', 'Summary of test book 1', 'ISBN111111', producers[4], [genres[0],genres[1]], callback);
            },
            function(callback) {
                movieCreate('Test Movie 2', 'Summary of test book 2', 'ISBN222222', producers[4], false, callback)
            }
        ],
        // optional callback
        cb);
}


function createMovieInstances(cb) {
    async.parallel([
            function(callback) {
                movieInstanceCreate(movies[0], 'London Gollancz, 2014.', false, 'Available', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[1], ' Gollancz, 2011.', false, 'Loaned', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[2], ' Gollancz, 2015.', false, false, callback)
            },
            function(callback) {
                movieInstanceCreate(movies[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[3], 'New York Tom Doherty Associates, 2016.', false, 'Available', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Available', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Maintenance', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[4], 'New York, NY Tom Doherty Associates, LLC, 2015.', false, 'Loaned', callback)
            },
            function(callback) {
                movieInstanceCreate(movies[0], 'Imprint XXX2', false, false, callback)
            },
            function(callback) {
                movieInstanceCreate(movies[1], 'Imprint XXX3', false, false, callback)
            }
        ],
        // Optional callback
        cb);
}



async.series([
        createGenreProducers,
        createMovies,
        createMovieInstances
    ],
// Optional callback
    function(err, results) {
        if (err) {
            console.log('FINAL ERR: '+err);
        }
        else {
            console.log('MOVIEInstances: '+movieinstances);

        }
        // All done, disconnect from database
        mongoose.connection.close();
    });
