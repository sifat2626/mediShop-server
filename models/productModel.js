const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    photos: [{ type: String }],
    description: { type: String },
    metaKey: { type: String },
    stockStatus: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    categories: [{
        primary: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        secondary: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        tertiary: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    }],
    variants: [{
        mgOption: { type: Number, required: true }, // Dosage strength (e.g., 50mg, 100mg)
        price: { type: Number, required: true },    // Price for this dosage
        stockStatus: { type: Boolean, default: true } // Stock availability for this dosage
    }],
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
