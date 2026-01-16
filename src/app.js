import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware de seguridad con Helmet
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    referrerPolicy: { policy: 'no-referrer' }
}));

// Middleware para parsear datos de formularios y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones con cookies HTTP-only
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,          // Previene acceso vía JavaScript
        sameSite: 'strict',      // Protege contra CSRF
        secure: false,           // Cambiar a 'true' en producción con HTTPS
        maxAge: 10 * 60 * 1000   // 10 minutos de expiración
    }
}));

// Configurar motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para mostrar información de sesión (debug)
app.use((req, res, next) => {
    console.log('Sesión ID:', req.sessionID);
    console.log('Usuario en sesión:', req.session.userId || 'No autenticado');
    next();
});

// Usar las rutas de autenticación (¡ESTO ES LO QUE FALTABA!)
app.use('/', authRoutes);

// Ruta 404 para páginas no encontradas
app.use((req, res) => {
    res.status(404).send('Página no encontrada');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔐 Sesiones seguras con cookies httpOnly activadas`);
    console.log(`🗄️  Conectado a PostgreSQL: ${process.env.DATABASE_URL?.split('@')[1]}`);
    console.log(`👤 Rutas disponibles:`);
    console.log(`   http://localhost:${PORT}/login`);
    console.log(`   http://localhost:${PORT}/register`);
    console.log(`   http://localhost:${PORT}/user (protegido)`);
    console.log(`   http://localhost:${PORT}/admin (protegido)`);
    console.log(`   http://localhost:${PORT}/logout`);
});