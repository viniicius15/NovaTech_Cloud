const express = require("express");

const produtosRoutes = require("./routes/produtos.routes");
const authRoutes = require("./routes/auth.routes");
const vendasRoutes = require("./routes/vendas.routes");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173"
}));


app.use(express.json());
app.use("/vendas", vendasRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "NovaTech Cloud API funcionando!"
    });
});

app.get("/health", (req, res) => {
    res.json({
        status: "OK"
    });
});

app.use("/produtos", produtosRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});