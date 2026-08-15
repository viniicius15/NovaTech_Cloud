import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function NovoProduto({ mostrarMensagem, onProdutoCriado, onFechar }) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});

  function limparErro(campo) {
    setErros((atual) => {
      if (!atual[campo]) return atual;

      const copia = { ...atual };
      delete copia[campo];
      return copia;
    });
  }

  function validar() {
    const novosErros = {};

    const nomeLimpo = nome.trim();
    const precoNumero = Number(preco);
    const estoqueNumero = Number(estoque);

    if (!nomeLimpo) {
      novosErros.nome = "Informe o nome do produto.";
    }

    if (preco === "") {
      novosErros.preco = "Informe o preço.";
    } else if (Number.isNaN(precoNumero) || precoNumero <= 0) {
      novosErros.preco = "Preço inválido.";
    }

    if (estoque !== "" && (Number.isNaN(estoqueNumero) || estoqueNumero < 0)) {
      novosErros.estoque = "Estoque inválido.";
    }

    setErros(novosErros);

    return Object.keys(novosErros).length === 0;
  }

  async function criarProduto(e) {
    e.preventDefault();

    if (!validar()) {
      mostrarMensagem("Corrija os campos destacados.", "error");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      mostrarMensagem("Sua sessão expirou. Faça login novamente.", "error");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/produtos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nome.trim(),
          preco: Number(preco),
          estoque: estoque === "" ? 0 : Number(estoque),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarMensagem(dados.error || "Erro ao criar produto.", "error");
        return;
      }

      mostrarMensagem(`Produto "${dados.nome}" cadastrado com sucesso!`);

      setNome("");
      setPreco("");
      setEstoque("");
      setErros({});

      await onProdutoCriado();
      onFechar();
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao conectar com o servidor.", "error");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="produto-form-overlay">
      <div className="produto-form-card">
        <div className="produto-form-header">
          <h3>Novo produto</h3>

          <button
            type="button"
            className="produto-form-fechar"
            onClick={onFechar}
          >
            ×
          </button>
        </div>

        <form onSubmit={criarProduto} noValidate>
          <div className="input-group">
            <label>Nome do produto</label>

            <div className="input-wrapper">
              <span>📦</span>

              <input
                type="text"
                placeholder="Ex: Mouse sem fio"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  limparErro("nome");
                }}
              />
            </div>

            {erros.nome && <span className="campo-erro">{erros.nome}</span>}
          </div>

          <div className="input-group">
            <label>Preço (R$)</label>

            <div className="input-wrapper">
              <span>R$</span>

              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={preco}
                onChange={(e) => {
                  setPreco(e.target.value);
                  limparErro("preco");
                }}
              />
            </div>

            {erros.preco && <span className="campo-erro">{erros.preco}</span>}
          </div>

          <div className="input-group">
            <label>Estoque inicial</label>

            <div className="input-wrapper">
              <span>#</span>

              <input
                type="number"
                min="0"
                placeholder="0"
                value={estoque}
                onChange={(e) => {
                  setEstoque(e.target.value);
                  limparErro("estoque");
                }}
              />
            </div>

            {erros.estoque && (
              <span className="campo-erro">{erros.estoque}</span>
            )}
          </div>

          <button className="login-button" type="submit" disabled={carregando}>
            {carregando ? "Salvando..." : "Cadastrar produto →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NovoProduto;