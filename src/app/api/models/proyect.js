import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;
const proyectSchema = new Schema({
  name : {
    max : [60, 'max length excede'],
    type: String,
    required: true
  },
  description : {
    type: String,
    max : [300, 'max length exceded'],
    min : [1, 'min length exceded'],
    required: true
  },
  department : {
    type: String,
    max : [60, 'max length exceded'],
    required: true
  },
  city : {
    type: String,
    max : [60, 'max length exceded'],
    required: true
  },
  address: {
    type: String,
    max : [300, 'max length exceded'],
    required : true
  },
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'Plan',
    required: true  
  },
  //temporal info
  dateInit : {
    type : Date,
    required: false
  },
  dateFinish : {
    type: Date,
    required : false
  },
  //data proyect inside
  creation_date: {
    type: Date, 
    default: Date.now 
   },
   state : {
    type: String,
    required: true,
    enum : ['Actived', 'ended', 'Canceled'],
    default: 'Actived'
  },
  idCompany : {
    type : Schema.Types.ObjectId,
    ref : 'Company',
    required : true
  }
});

const Proyect = mongoose.model.Proyect ??  mongoose.model('Proyect', proyectSchema);
export default Proyect;