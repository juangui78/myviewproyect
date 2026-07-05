import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;
const leadsSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: false
  },
  idProyect: {
    type: Schema.Types.ObjectId,
    ref: 'Proyect',
    required: true
  },
  idCompany: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  terrainId: {
    type: String,
    required: false
  },
  terrainName: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['Nuevo', 'Contactado', 'Ganado', 'Perdido'],
    default: 'Nuevo'
  },
  creation_date: {
    type: Date,
    default: Date.now
  }
});

const Leads = mongoose.models.Leads ?? mongoose.model('Leads', leadsSchema);
export default Leads;
