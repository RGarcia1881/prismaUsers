import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mostrar formulario de login
export const showLogin = (req, res) => {
    res.render('login', { error: null });
};

// Mostrar formulario de registro
export const showRegister = (req, res) => {
    res.render('register', { error: null });
};

// Registrar nuevo usuario
export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos
        if (!email || !password) {
            return res.render('register', { error: 'Todos los campos son obligatorios.' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.render('register', { error: 'El usuario ya existe.' });
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario en la base de datos
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'user' // Por defecto
            }
        });

        // Redirigir al login
        res.redirect('/login');
    } catch (error) {
        console.error('Error en registro:', error);
        res.render('register', { error: 'Error en el servidor. Intenta nuevamente.' });
    }
};

// Iniciar sesión
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.render('login', { error: 'Credenciales incorrectas.' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.render('login', { error: 'Credenciales incorrectas.' });
        }

        // Crear sesión
        req.session.userId = user.id;
        req.session.email = user.email;
        req.session.role = user.role;

        console.log(`✅ Usuario ${user.email} inició sesión`);

        // Redirigir según el rol
        if (user.role === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/user');
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.render('login', { error: 'Error en el servidor. Intenta nuevamente.' });
    }
};

// Cerrar sesión
export const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error al cerrar sesión:', err);
        }
        res.redirect('/login');
    });
};

// Página de usuario normal
export const userPage = (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    res.render('user', {
        email: req.session.email,
        role: req.session.role
    });
};

// Página de administrador
export const adminPage = async (req, res) => {
    try {
        if (!req.session.userId || req.session.role !== 'admin') {
            return res.redirect('/login');
        }

        // Obtener todos los usuarios para mostrar en el panel
        const allUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.render('admin', {
            email: req.session.email,
            role: req.session.role,
            users: allUsers
        });
    } catch (error) {
        console.error('Error en panel admin:', error);
        res.redirect('/user');
    }
};