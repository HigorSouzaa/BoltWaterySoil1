const mongoose = require("mongoose");

/**
 * Schema do usuário.
 * Cada campo é documentado inline para facilitar entendimento e manutenção.
 */
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },                 // Nome completo do usuário
  email: { type: String, required: true, unique: true },  // E-mail único, usado para login
  password: { type: String, required: true },             // Senha hash (NUNCA armazenar senha em texto puro)
});

// Exporta o modelo para uso nos controladores
module.exports = mongoose.model("User", UserSchema);
