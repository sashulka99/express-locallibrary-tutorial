var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var moment = require('moment');

var ProducerSchema = new Schema(
    {
        first_name: {type: String, required: true, max: 100},
        family_name: {type: String, required: true, max: 100},
        date_of_birth: {type: Date},
        date_of_death: {type: Date},
    }
);

// Virtual for author's full name
ProducerSchema
    .virtual('name')
    .get(function () {

// To avoid errors in cases where an producer does not have either a family name or first name
// We want to make sure we handle the exception by returning an empty string for that case

        var fullname = '';
        if (this.first_name && this.family_name) {
            fullname = this.family_name + ', ' + this.first_name
        }
        if (!this.first_name || !this.family_name) {
            fullname = '';
        }

        return fullname;
    });

// Virtual for producer's lifespan
ProducerSchema
    .virtual('lifespan')
    .get(function () {
        //return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
        return (this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD'): '' - this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '')
    });

// Virtual for producer's URL
ProducerSchema
    .virtual('url')
    .get(function () {
        return '/catalog/producer/' + this._id;
    });

ProducerSchema
    .virtual('date_formatted')
    .get(function () {
        return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
    });

ProducerSchema
    .virtual('date_death_formatted')
    .get(function () {
        return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
    });

//Export model
module.exports = mongoose.model('Producer', ProducerSchema);