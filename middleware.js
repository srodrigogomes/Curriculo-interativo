const jwt = require('jsonwebtoken');

const SECRET_KEY = 'seu_segredo_super_secreto_e_futurista'; 

const protectRoute = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Adiciona os dados do usuário ao request
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

module.exports = { protectRoute };