import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;

const company_schema = new Schema({
  plan : {
    type: String, //
    required: true
  },
  initFree : {
    type : Date,
    default: Date.now,
    required: true 
  },
  finalFree : {
    type: Date,
    required : true
  },
});

const Company = mongoose.model.Company ??  mongoose.model('Company', company_schema);
export default Company;