const express = require("express");
const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Listar produtos
router.get("/", async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            orderBy: {
                id: "desc"
            }
        });

        res.json(produtos);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar produtos"
        });
    }
});

// Buscar um produto
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                error: "ID inválido"
            });
        }

        const produto = await prisma.produto.findUnique({
            where: { id }
        });

        if (!produto) {
            return res.status(404).json({
                error: "Produto não encontrado"
            });
        }

        res.json(produto);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao buscar produto"
        });
    }
});

// Criar produto
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { nome, preco, estoque } = req.body;

        if (!nome || preco === undefined) {
            return res.status(400).json({
                error: "Nome e preço são obrigatórios"
            });
        }

        const produto = await prisma.produto.create({
            data: {
                nome,
                preco: Number(preco),
                estoque: Number(estoque || 0)
            }
        });

        res.status(201).json(produto);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Erro ao criar produto"
        });
    }
});

// Atualizar produto
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                error: "ID inválido"
            });
        }

        const { nome, preco, estoque } = req.body;

        const produto = await prisma.produto.update({
            where: { id },
            data: {
                ...(nome !== undefined && { nome }),
                ...(preco !== undefined && { preco: Number(preco) }),
                ...(estoque !== undefined && { estoque: Number(estoque) })
            }
        });

        res.json(produto);
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Produto não encontrado"
            });
        }

        console.error(error);

        res.status(500).json({
            error: "Erro ao atualizar produto"
        });
    }
});

// Excluir produto
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({
                error: "ID inválido"
            });
        }

        await prisma.produto.delete({
            where: { id }
        });

        res.status(204).send();
    } catch (error) {
        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Produto não encontrado"
            });
        }

        console.error(error);

        res.status(500).json({
            error: "Erro ao excluir produto"
        });
    }
});

module.exports = router;