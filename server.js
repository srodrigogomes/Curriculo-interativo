const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateUser, generateToken } = require('./auth');
const { protectRoute } = require('./middleware');
const { 
  getProfile, 
  updateProfile, 
  getData, 
  addData, 
  updateData, 
  deleteData,
  deleteFile
} = require('./dataManager');

const app = express();
const PORT = 3001;

// --- Configuração Multer (Upload de Arquivos) ---
const UPLOADS_DIR = path.join(__dirname, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = path.join(UPLOADS_DIR);

    if (file.fieldname === 'profileImage') {
      dest = path.join(UPLOADS_DIR, 'perfil');
    } else if (file.fieldname === 'resume') {
      dest = path.join(UPLOADS_DIR, 'resume');
    } else if (file.fieldname === 'certificatePdf') {
      dest = path.join(UPLOADS_DIR, 'certificados');
    } else if (file.fieldname === 'certificateThumb') {
      dest = path.join(UPLOADS_DIR, 'thumbs');
    } else if (file.fieldname === 'publicationFile') {
      dest = path.join(UPLOADS_DIR, 'publicacoes');
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// --- Middlewares Globais ---
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos (uploads e frontend)
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, 'public'))); // Servir o React App

// --- ROTAS PÚBLICAS ---

// Rota de Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await authenticateUser(username, password);

  if (user) {
    const token = generateToken(user);
    return res.json({ token, user: { username: user.username } });
  }
  res.status(401).json({ message: 'Credenciais inválidas.' });
});

// Obter todos os dados do portfólio (Certificados, Publicações, Perfil)
app.get('/api/portfolio/data', (req, res) => {
  const profile = getProfile();
  const certificates = getData('certificates');
  const publications = getData('publications');
  res.json({ profile, certificates, publications });
});

// --- ROTAS PROTEGIDAS (PAINEL ADMIN) ---

// Obter/Atualizar Perfil
app.route('/api/admin/profile')
  .get(protectRoute, (req, res) => {
    res.json(getProfile());
  })
  .put(protectRoute, (req, res) => {
    const updated = updateProfile(req.body);
    res.json(updated);
  });

// Upload de Arquivos Individuais
app.post('/api/admin/upload/profile-image', protectRoute, upload.single('profileImage'), (req, res) => {
    try {
        if (req.file) {
            const oldPath = getProfile().profileImagePath;
            // Deleta imagem antiga, se não for a default
            if (oldPath && oldPath !== '/uploads/perfil/default.png') {
                deleteFile(oldPath);
            }
            const newProfile = updateProfile({ profileImagePath: '/uploads/perfil/' + req.file.filename });
            return res.json({ message: 'Foto de perfil atualizada com sucesso.', profile: newProfile });
        }
        res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    } catch (error) {
        console.error('Erro no upload de imagem de perfil:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

app.post('/api/admin/upload/resume', protectRoute, upload.single('resume'), (req, res) => {
    try {
        if (req.file) {
            const oldPath = getProfile().resumePath;
            // Deleta PDF de currículo antigo
            if (oldPath) {
                deleteFile(oldPath);
            }
            const newProfile = updateProfile({ resumePath: '/uploads/resume/' + req.file.filename });
            return res.json({ message: 'Currículo atualizado com sucesso.', profile: newProfile });
        }
        res.status(400).json({ message: 'Nenhum arquivo enviado.' });
    } catch (error) {
        console.error('Erro no upload do currículo:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// Rotas de Certificados
app.route('/api/admin/certificates')
  .post(protectRoute, upload.fields([{ name: 'certificatePdf', maxCount: 1 }, { name: 'certificateThumb', maxCount: 1 }]), (req, res) => {
    if (!req.files || !req.files.certificatePdf || !req.files.certificateThumb) {
      return res.status(400).json({ message: 'PDF e Thumbnail são obrigatórios.' });
    }
    const pdfPath = '/uploads/certificados/' + req.files.certificatePdf[0].filename;
    const thumbPath = '/uploads/thumbs/' + req.files.certificateThumb[0].filename;
    const newCert = addData('certificates', { 
        ...req.body, 
        pdfPath, 
        thumbPath 
    });
    res.status(201).json(newCert);
  });

app.route('/api/admin/certificates/:id')
  .put(protectRoute, (req, res) => {
    const updatedCert = updateData('certificates', req.params.id, req.body);
    if (!updatedCert) return res.status(404).json({ message: 'Certificado não encontrado.' });
    res.json(updatedCert);
  })
  .delete(protectRoute, (req, res) => {
    const deletedCert = deleteData('certificates', req.params.id);
    if (!deletedCert) return res.status(404).json({ message: 'Certificado não encontrado.' });
    
    // Deleta arquivos associados
    deleteFile(deletedCert.pdfPath);
    deleteFile(deletedCert.thumbPath);

    res.json({ message: 'Certificado e arquivos associados deletados.', id: req.params.id });
  });


// Rotas de Publicações
app.route('/api/admin/publications')
  .post(protectRoute, upload.single('publicationFile'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Arquivo de publicação é obrigatório.' });
    }
    const filePath = '/uploads/publicacoes/' + req.file.filename;
    const newPub = addData('publications', { ...req.body, filePath });
    res.status(201).json(newPub);
  });

app.route('/api/admin/publications/:id')
  .put(protectRoute, (req, res) => {
    const updatedPub = updateData('publications', req.params.id, req.body);
    if (!updatedPub) return res.status(404).json({ message: 'Publicação não encontrada.' });
    res.json(updatedPub);
  })
  .delete(protectRoute, (req, res) => {
    const deletedPub = deleteData('publications', req.params.id);
    if (!deletedPub) return res.status(404).json({ message: 'Publicação não encontrada.' });
    
    // Deleta arquivo associado
    deleteFile(deletedPub.filePath);

    res.json({ message: 'Publicação e arquivo associado deletados.', id: req.params.id });
  });


// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor futurista rodando em http://localhost:${PORT}`);
  console.log(`🔑 Painel Admin disponível em http://localhost:${PORT}/admin`);
});