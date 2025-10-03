const mongoose = require("mongoose");

/**
 * Schema do ambiente.
 * Representa um ambiente de cultivo (ex: Estufa 1, Campo Norte, etc.)
 */
const EnvironmentSchema = new mongoose.Schema({
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
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adiciona created_at e updated_at automaticamente
});

// Índices para melhor performance
EnvironmentSchema.index({ user_id: 1, name: 1 });
EnvironmentSchema.index({ user_id: 1, is_active: 1 });

// Exporta o modelo para uso nos controladores
module.exports = mongoose.model("Environment", EnvironmentSchema);
