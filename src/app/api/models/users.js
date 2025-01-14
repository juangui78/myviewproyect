import mongoose from "mongoose";
 
mongoose.models = {};
const Schema = mongoose.Schema;

const user_schema = new Schema({
  type :{ // three options normal | company | admin => us
    type: String,
    trim: true,
    lowercase: true,
    enum : ['normal', 'company', 'admin'],
    required: true
  },
  name : {
    type : String,
    required: [true,'is required'],
    max: [50, 'max length exceded'],
    min: [5, 'min length required'],
    trim: true,
    lowercase: true
  } ,
  lastName : {
    type : String,
    required: false,
    max: [50, 'max length exceded'],
    min: [5, 'min length required'],
    trim: true,
    lowercase: true
  },
  email : {
    type: String,
    required: [true,'is required'],
    max : [50, 'max length exceded'],
    trim: true,
  },
  password: {
    type : String,
    required: false,
    max: [300, 'max length exceded'],
  },
  age : {
    type : Date,
    min: '1950-09-28',
    max: '2100-05-23',
  },
  created : {
    type : Date,
    default: Date.now 
  },
  request: { // this is when a user company invited new user => send email and create account
    type: Boolean,
    required: false,
    default: false,
  },
  permissions: {
    view : {
      type : Boolean,
      default : false,
    },
    createEdit : {
      type: Boolean,
      default: false
    }
  },
  configurations : {
    feed : {
      type: String,
      required: true,
      default : 'cards',
      enum : ['cards', 'table']
    },
    timeline : {
      type: String,
      required: true,
      enum : ['timeline', 'table'],
      default : 'timeline'
    }
  },
  id_Company : {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: false,
    default: null
  }
});

const User = mongoose.model.User ??  mongoose.model('User', user_schema);

export default User;