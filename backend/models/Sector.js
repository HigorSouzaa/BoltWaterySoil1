const mongoose = require("mongoose");

/**
 * Schema do setor.
 * Representa um setor dentro de um ambiente (ex: Setor A, Setor B, etc.)
 */
const SectorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  environment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Environment',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  area_size: {
    type: Number, // em metros quadrados
    min: 0
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  soil_type: {
    type: String,
    enum: ['sand', 'loam', 'clay'],
    default: 'loam',
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// Índices para melhor performance
SectorSchema.index({ environment_id: 1, is_active: 1 });
SectorSchema.index({ user_id: 1, is_active: 1 });

// Exporta o modelo para uso nos controladores
module.exports = mongoose.model("Sector", SectorSchema);
