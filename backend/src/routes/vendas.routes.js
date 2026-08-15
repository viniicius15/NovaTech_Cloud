const express = require("express");
const router = express.Router();

const prisma = require("../lib/prisma");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", async (req, res) => {
  try {
    const { itens } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        erro: "O carrinho precisa ter pelo menos um item."
      });
    }

    const venda = await prisma.$transaction(async (tx) => {
      let total = 0;
      const itensVenda = [];

      for (const item of itens) {
        const produto = await tx.produto.findUnique({
          where: {
            id: item.produtoId
          }
        });

        if (!produto) {
          throw new Error(`Produto ${item.produtoId} não encontrado.`);
        }

        if (produto.estoque < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para o produto ${produto.nome}.`
          );
        }

        total += produto.preco * item.quantidade;

        await tx.produto.update({
          where: {
            id: produto.id
          },
          data: {
            estoque: {
              decrement: item.quantidade
            }
          }
        });

        itensVenda.push({
          produtoId: produto.id,
          quantidade: item.quantidade,
          precoUnitario: produto.preco
        });
      }

      return await tx.venda.create({
        data: {
          userId: req.userId,
          total,
          itens: {
            create: itensVenda
          }
        },
        include: {
          itens: true
        }
      });
    });

    res.status(201).json(venda);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      erro: error.message
    });
  }
});

module.exports = router;