import mongoose from "mongoose";

mongoose.models = {};

const Schema = mongoose.Schema;

const company_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: "Colombia"
  },
  department: {
    type: String,
    required: false
  },
  city: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  cell: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  propertyType: {
    type : String,
    required: false,
    enum: ['residenciales', 'comerciales', 'industriales', 'rústicas o rurales', 'de lujo', 'otros']
  },
  geographicScope: {
    type: String,
    required: false,
    enum: ['local', 'regional', 'nacional', 'internacional']
  },
  marketApproach: {
    type: String,
    required: false,
    enum: ['residencial', 'comercial','inversiones', 'gestion de patrimonio', 'otros']
  },
  active: {
    type: Boolean,
    default: true,
    required: false
  },
  creationDate: {
    type: Date,
    default: Date.now,
    required: false
  },
  additionalProyect: { //proyectos adicionales si se compra
    type: Number,
    required: false,
    default: 0
  },
  id_plan: {
    type: Schema.Types.ObjectId,
    ref: 'Plans',
    required: false
  }
});


company_schema.pre('save', function (next) {
  if (this.country) this.country = this.country.toLowerCase();
  if (this.city) this.city = this.city.toLowerCase();
  if (this.department) this.department = this.department.toLowerCase();
  next();
})


const Company = mongoose.models.Company || mongoose.model('Company', company_schema);
export default Company;
