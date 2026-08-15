const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

// Registrar usuário
router.post("/register", async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({
                error: "Nome, email e senha são obrigatórios"
            });
        }

        if (senha.length < 6) {
            return res.status(400).json({
                error: "Senha deve ter no mínimo 6 caracteres"
            });
        }

        const existente = await prisma.user.findUnique({
            where: { email }
        });

        if (existente) {
            return res.status(409).json({
                error: "Email já cadastrado"
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const user = await prisma.user.create({
            data: {
                nome,
                email,
                senha: senhaHash
            }
        });

        res.status(201).json({
            id: user.id,
            nome: user.nome,
            email: user.email
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao registrar usuário"
        });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({
                error: "Email e senha são obrigatórios"
            });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                error: "Email ou senha inválidos"
            });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);

        if (!senhaValida) {
            return res.status(401).json({
                error: "Email ou senha inválidos"
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao fazer login"
        });
    }
});

module.exports = router;