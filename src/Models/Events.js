const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    eventName: String,
    sales: Number,
    incentives: Number,
    totalIn: Number,
    totalOut: Number,
    revenue: Number
});

const brandSchema = new mongoose.Schema({
    brandName: String,
    sales: Number,
    incentives: Number,
    totalIn: Number,
    totalOut: Number,
    revenue: Number,
    events: [eventSchema]
});

const dateSchema = new mongoose.Schema({
    date: Date,
    sales: Number,
    incentives: Number,
    totalIn: Number,
    totalOut: Number,
    revenue: Number,
    brands: [brandSchema]
});

module.exports = mongoose.model('Event', dateSchema);
