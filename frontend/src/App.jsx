import { useEffect, useMemo, useState } from "react";
import "./css/index.css";
import Login from "./Login";
import Cadastro from "./Cadastro";
import Dashboard from "./Dashboard";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modoCadastro, setModoCadastro] = useState(false);

  const [usuario, setUsuario] = useState(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!usuarioSalvo) return null;

    try {
      return JSON.parse(usuarioSalvo);
    } catch {
      return null;
    }
  });

  const [logado, setLogado] = useState(() => {
    const token = localStorage.getItem("token");
    const usuarioSalvo = localStorage.getItem("usuario");

    if (!token || !usuarioSalvo) return false;

    try {
      JSON.parse(usuarioSalvo);
      return true;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      return false;
    }
  });

  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState("success");

  const [carregando, setCarregando] = useState(false);

  function mostrarMensagem(texto, tipo = "success") {
    setMensagem(texto);
    setTipoMensagem(tipo);

    setTimeout(() => {
      setMensagem("");
    }, 3500);
  }

  async function carregarProdutos(token) {
    try {
      const resposta = await fetch(`${API_URL}/produtos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarMensagem(
          dados.error || dados.erro || "Erro ao carregar produtos.",
          "error"
        );
        return;
      }

      setProdutos(dados);
    } catch (error) {
      console.error(error);
      mostrarMensagem("Não foi possível conectar ao servidor.", "error");
    }
  }

  async function fazerLogin(e) {
    e.preventDefault();

    if (!email || !senha) {
      mostrarMensagem("Preencha seu e-mail e sua senha.", "error");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarMensagem(dados.error || "E-mail ou senha inválidos.", "error");
        return;
      }

      localStorage.setItem("token", dados.token);
      localStorage.setItem("usuario", JSON.stringify(dados.user));

      setUsuario(dados.user);
      setLogado(true);

      await carregarProdutos(dados.token);

      mostrarMensagem(`Bem-vindo, ${dados.user.nome}!`);
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao conectar com o servidor.", "error");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || !logado) {
      return;
    }

    let ignore = false;

    async function carregarProdutosInicial() {
      try {
        const resposta = await fetch(`${API_URL}/produtos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dados = await resposta.json();

        if (ignore) return;

        if (!resposta.ok) {
          mostrarMensagem(
            dados.error || dados.erro || "Erro ao carregar produtos.",
            "error"
          );
          return;
        }

        setProdutos(dados);
      } catch (error) {
        if (!ignore) {
          console.error(error);
          mostrarMensagem("Não foi possível conectar ao servidor.", "error");
        }
      }
    }

    carregarProdutosInicial();

    return () => {
      ignore = true;
    };
  }, []);

  function adicionarCarrinho(produto) {
    if (produto.estoque <= 0) {
      mostrarMensagem("Produto sem estoque.", "error");
      return;
    }

    const existente = carrinho.find((item) => item.produtoId === produto.id);

    if (existente) {
      if (existente.quantidade >= produto.estoque) {
        mostrarMensagem("Quantidade máxima disponível no estoque.", "error");
        return;
      }

      setCarrinho(
        carrinho.map((item) =>
          item.produtoId === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
              }
            : item
        )
      );

      return;
    }

    setCarrinho([
      ...carrinho,
      {
        produtoId: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        estoque: produto.estoque,
        quantidade: 1,
      },
    ]);

    mostrarMensagem(`${produto.nome} adicionado ao carrinho.`);
  }

  function aumentarQuantidade(produtoId) {
    setCarrinho(
      carrinho.map((item) => {
        if (item.produtoId !== produtoId) {
          return item;
        }

        if (item.quantidade >= item.estoque) {
          mostrarMensagem("Estoque máximo atingido.", "error");
          return item;
        }

        return {
          ...item,
          quantidade: item.quantidade + 1,
        };
      })
    );
  }

  function diminuirQuantidade(produtoId) {
    setCarrinho(
      carrinho
        .map((item) => {
          if (item.produtoId !== produtoId) {
            return item;
          }

          return {
            ...item,
            quantidade: item.quantidade - 1,
          };
        })
        .filter((item) => item.quantidade > 0)
    );
  }

  function removerCarrinho(produtoId) {
    setCarrinho(carrinho.filter((item) => item.produtoId !== produtoId));

    mostrarMensagem("Produto removido do carrinho.");
  }

  async function finalizarVenda() {
    const token = localStorage.getItem("token");

    if (!token) {
      logout();
      return;
    }

    if (carrinho.length === 0) {
      mostrarMensagem("Seu carrinho está vazio.", "error");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch(`${API_URL}/vendas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itens: carrinho.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
          })),
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarMensagem(
          dados.erro || "Não foi possível finalizar a venda.",
          "error"
        );
        return;
      }

      setCarrinho([]);

      await carregarProdutos(token);

      mostrarMensagem(`Venda #${dados.id} realizada com sucesso!`);
    } catch (error) {
      console.error(error);
      mostrarMensagem("Erro ao finalizar venda.", "error");
    } finally {
      setCarregando(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");

    setLogado(false);
    setUsuario(null);
    setProdutos([]);
    setCarrinho([]);
    setEmail("");
    setSenha("");
  }

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [produtos, busca]);

  const quantidadeCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const total = carrinho.reduce(
    (soma, item) => soma + item.preco * item.quantidade,
    0
  );

  const estoqueTotal = produtos.reduce(
    (total, produto) => total + produto.estoque,
    0
  );

  if (!logado && modoCadastro) {
    return (
      <Cadastro
        mostrarMensagem={mostrarMensagem}
        onCadastroSucesso={() => setModoCadastro(false)}
        onVoltarLogin={() => setModoCadastro(false)}
      />
    );
  }

  if (!logado) {
    return (
      <Login
        email={email}
        setEmail={setEmail}
        senha={senha}
        setSenha={setSenha}
        fazerLogin={fazerLogin}
        carregando={carregando}
        mensagem={mensagem}
        tipoMensagem={tipoMensagem}
        onIrParaCadastro={() => setModoCadastro(true)}
      />
    );
  }

  async function recarregarProdutos() {
    const token = localStorage.getItem("token");

    if (!token) return;

    await carregarProdutos(token);
  }

  return (
    <Dashboard
      usuario={usuario}
      logout={logout}
      mensagem={mensagem}
      tipoMensagem={tipoMensagem}
      busca={busca}
      setBusca={setBusca}
      produtosFiltrados={produtosFiltrados}
      carrinho={carrinho}
      quantidadeCarrinho={quantidadeCarrinho}
      total={total}
      estoqueTotal={estoqueTotal}
      produtos={produtos}
      carregando={carregando}
      adicionarCarrinho={adicionarCarrinho}
      aumentarQuantidade={aumentarQuantidade}
      diminuirQuantidade={diminuirQuantidade}
      removerCarrinho={removerCarrinho}
      finalizarVenda={finalizarVenda}
      recarregarProdutos={recarregarProdutos}
      mostrarMensagem={mostrarMensagem}
    />
  );
}

export default App;