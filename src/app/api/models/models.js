import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;

const models_schema = new Schema({
  name: {
    type: String,
    required: [true, "is required"],
    max: [50, "max length exceded"],
    min: [5, "min length required"],
    trim: true,

  },
  description: {
    type: String,
    required: false,
    max: [200, "max length exceded"],
    min: [5, "min length required"],
    trim: true,

  },
  model: {
    url: {
      type: String,
      required: true
    }
  },
  idProyect: {
    type: Schema.Types.ObjectId,
    ref: 'Proyect',
    required: true
  },
  terrains : {
    type : Array,
    required : false
  },
  markers : {
    type : Array,
    required : false
  },
  background360 : {
    type : String,
    required : false
  },
  creation_date: {
    type: Date,
    default: Date.now
  },

});

const Model = mongoose.model.Model ?? mongoose.model('Model', models_schema);
export default Model;