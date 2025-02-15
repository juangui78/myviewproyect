import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;

const company_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['static', 'basic', 'medium', 'pro', 'enterprise'],
    default: 'static',
    required: true
  },
  numberRequest: {
    type: Number,
    min: 0,
    required: true
  },
  numbersOfModels: { // number of model per project
    type: Number,
    min: 3,
    required: true
  },
  updateFrequency: { // update frequency of the model, needs to be updated after we know the real values
    type: String,
    enum: ['1 per month', 'weekly', 'monthly'],
    required: true
  },
  modelQuality: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  area: { // these values are for the area in hectares
    type: Number,
    default: 0.5,
    required: true
  },
  monthsOfScan: {
    type: [Number], // first value is the total months and the second is the month we are in
    required: true
  },
  totalPrice: { // this is the total price of the plan
    type: Number,
    required: true
  },
  pricePerMonth: { // this is the price per month
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now,
    required: true
  },
});

const Company = mongoose.models.Company ?? mongoose.model('Company', company_schema);
export default Company;
