const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const PROFILE_DIR = path.join(UPLOADS_DIR, 'perfil');

// Cria pastas necessárias se não existirem
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });

// Função para ler o banco de dados
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler db.json:', error.message);
    // Retorna uma estrutura básica se falhar
    return { profile: {}, certificates: [], publications: [], user: {} };
  }
};

// Função para escrever no banco de dados
const writeDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// --- Profile CRUD ---
const getProfile = () => readDB().profile;

const updateProfile = (profileData) => {
  const db = readDB();
  db.profile = { ...db.profile, ...profileData };
  writeDB(db);
  return db.profile;
};

// --- Data CRUD (Certificates & Publications) ---
const getData = (type) => readDB()[type] || [];

const addData = (type, data) => {
  const db = readDB();
  const newItem = { id: uuidv4(), ...data };
  db[type].push(newItem);
  writeDB(db);
  return newItem;
};

const updateData = (type, id, data) => {
  const db = readDB();
  const index = db[type].findIndex(item => item.id === id);
  if (index !== -1) {
    db[type][index] = { ...db[type][index], ...data, id };
    writeDB(db);
    return db[type][index];
  }
  return null;
};

const deleteData = (type, id) => {
  const db = readDB();
  const initialLength = db[type].length;
  const itemToDelete = db[type].find(item => item.id === id);

  db[type] = db[type].filter(item => item.id !== id);

  if (db[type].length < initialLength) {
    writeDB(db);
    return itemToDelete;
  }
  return null;
};

// --- File Management Helpers (used by server.js) ---
const deleteFile = (filePath) => {
  if (filePath && filePath.startsWith('/uploads')) {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Arquivo deletado: ${fullPath}`);
    }
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getData,
  addData,
  updateData,
  deleteData,
  readDB,
  deleteFile
};