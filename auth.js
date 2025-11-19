const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readDB } = require('./dataManager');

const SECRET_KEY = 'seu_segredo_super_secreto_e_futurista'; // Use uma chave forte na vida real!

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const authenticateUser = async (username, password) => {
  const db = readDB();
  const user = db.user;

  if (user && user.username === username) {
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (isMatch) {
      // Retorna um objeto básico de usuário para o token
      return { id: 1, username: user.username }; 
    }
  }
  return null;
};

module.exports = {
  generateToken,
  authenticateUser,
  hashPassword 
};