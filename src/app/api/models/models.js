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
  terrains: [{
    type: {
      type: String,
      required: [true, "Terrain type is required"],
      trim: true,
      enum: ['forest', 'mountain', 'urban', 'desert'] // ejemplo de tipos permitidos
    },
    markers: [{
      coordinates: {
        type: [Number],
        required: [true, "Coordinates are required"],
        validate: {
          validator: v => v.length === 2,
          message: props => `Coordinates must be [longitude, latitude], got ${props.value}`
        }
      },
      description: {
        type: String,
        trim: true,
        max: [100, "Max length exceeded"]
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
  }],
  creation_date: {
    type: Date,
    default: Date.now
  },

});

const Model = mongoose.model.Model ?? mongoose.model('Model', models_schema);
export default Model;