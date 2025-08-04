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
  //
  dateInit : { //fecha en que se empieza el proyecto
    type : Date,
    required: false
  },
  dateFinish : { // fecha en que se termina el proyecto (6 meses para tener los modelos necesarios)
    type: Date,
    required : false
  },
  //aditional info
  notes: {
    type: String,
    max : [500, 'max length exceded'],
    required: false
  },
  areaOfThisproyect: { // metros cuadrados que tiene este proyecto
    type: Number,
    required: true,
    default: 0
  },
  urlImage: {
    type: String,
    required: true,
    default: ''
  },
  linkWeb: {
    type: String,
    required: false,
    default: ''
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