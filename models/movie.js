var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MovieSchema = new Schema(
    {
        title: {type: String, required: true},
        producer: {type: Schema.Types.ObjectId, ref: 'Producer', required: true},
        summary: {type: String, required: true},
        isbn: {type: String, required: true},
        genre: [{type: Schema.Types.ObjectId, ref: 'Genre'}]
    }
);

// Virtual for book's URL
MovieSchema
    .virtual('url')
    .get(function () {
        return '/catalog/movie/' + this._id;
    });

//Export model
module.exports = mongoose.model('Movie', MovieSchema);