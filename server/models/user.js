import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // altri campi aggiuntivi qui se servono
});

// Campo virtuale "password" (non viene salvato nel database)
UserSchema.virtual('password')
  .set(function(password) {
    this._password = password; // viene usato solo per hash temporaneo
  })
  .get(function() {
    return this._password;
  });

// Middleware pre-save: genera l'hash della password se è stata impostata
UserSchema.pre('save', async function(next) {
  if (!this._password) {
    if (!this.passwordHash) {
      return next(new Error('Password mancante'));
    }
    return next(); // nessuna nuova password da processare
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this._password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Metodo di istanza per confrontare la password in chiaro con l'hash salvato
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', UserSchema);
export default User;
