const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    division: { type: String, required: true },
    district: { type: String, required: true },
    subDistrict: { type: String, required: true },
    address: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true }
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
