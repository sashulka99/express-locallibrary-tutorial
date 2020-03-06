var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var moment = require('moment');

var MovieInstanceSchema = new Schema(
    {
        movie: { type: Schema.Types.ObjectId, ref: 'Movie', required: true }, //reference to the associated movie
        imprint: {type: String, required: true},
        status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
        due_back: {type: Date, default: Date.now}
    }
);

// Virtual for movieinstance's URL
MovieInstanceSchema
    .virtual('url')
    .get(function () {
        return '/catalog/movieinstance/' + this._id;
    });

MovieInstanceSchema
    .virtual('due_back_formatted')
    .get(function () {
        return moment(this.due_back).format('MMMM Do, YYYY');
    });
MovieInstanceSchema
    .virtual('due_back_yyyy_mm_dd')
    .get(function () {
        return moment(this.due_back).format('YYYY-MM-DD');
    });

//Export model
module.exports = mongoose.model('MovieInstance', MovieInstanceSchema);