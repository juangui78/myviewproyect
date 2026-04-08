import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;
const notesSchema = new Schema({
  note : {
    max : [500, 'max length excede'],
    type: String,
    required: true
  },
  creation_date: {
    type: Date, 
    default: Date.now 
   },
   state : {
    type: String,
    required: true,
    enum : ['Active', 'Deleted'],
    default: 'Active'
  },
  idMode : {
    type : Schema.Types.ObjectId,
    ref : 'Model',
    required : true
  },
  userCreated : {
    type : Schema.Types.ObjectId,
    ref : 'User',
    required : true
  }
});

const Notes = mongoose.model.Notes ??  mongoose.model('Proyect', notesSchema);
export default Notes;