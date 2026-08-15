import { useEffect, useMemo, useState } from "react";
import "./css/index.css";

const API_URL = "http://localhost:3000";

function App() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [logado, setLogado] = useState(false);
  const [usuario, setUsuario] = useState(null);

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
    const usuarioSalvo = localStorage.getItem("usuario");

    if (token && usuarioSalvo) {
      try {
        const usuarioAtual = JSON.parse(usuarioSalvo);

        setUsuario(usuarioAtual);
        setLogado(true);

        carregarProdutos(token);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
      }
    }
  }, []);

  function adicionarCarrinho(produto) {
    if (produto.estoque <= 0) {
      mostrarMensagem("Produto sem estoque.", "error");
      return;
    }

    const existente = carrinho.find(
      (item) => item.produtoId === produto.id
    );

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
    setCarrinho(
      carrinho.filter((item) => item.produtoId !== produtoId)
    );

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

  if (!logado) {
    return (
      <div className="login-page">
        <div className="login-background">
          <div className="login-glow glow-one"></div>
          <div className="login-glow glow-two"></div>
        </div>

        <div className="login-wrapper">
          <div className="login-brand">
            <div className="brand-icon">N</div>
            <span>NovaTech</span>
          </div>

          <div className="login-card">
            <div className="login-header">
              <span className="welcome-badge">Bem-vindo de volta</span>

              <h1>Acesse sua conta</h1>

              <p>
                Entre no painel da NovaTech para gerenciar suas vendas.
              </p>
            </div>

            <form onSubmit={fazerLogin}>
              <div className="input-group">
                <label>E-mail</label>

                <div className="input-wrapper">
                  <span>✉</span>

                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Senha</label>

                <div className="input-wrapper">
                  <span>🔒</span>

                  <input
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
              </div>

              <button
                className="login-button"
                type="submit"
                disabled={carregando}
              >
                {carregando ? "Entrando..." : "Entrar no sistema →"}
              </button>
            </form>

            {mensagem && (
              <div className={`toast login-toast ${tipoMensagem}`}>
                {mensagem}
              </div>
            )}

            <div className="login-footer">
              <span>NovaTech Soluções</span>
              <span>•</span>
              <span>Sistema de gestão</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">
            <div className="brand-icon small">N</div>

            <div>
              <strong>NovaTech</strong>
              <span>Soluções</span>
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="user-info">
            <div className="avatar">
              {usuario?.nome?.charAt(0).toUpperCase()}
            </div>

            <div className="user-details">
              <strong>{usuario?.nome}</strong>
              <span>Administrador</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      {mensagem && (
        <div className={`toast ${tipoMensagem}`}>
          <span>{tipoMensagem === "success" ? "✓" : "!"}</span>
          {mensagem}
        </div>
      )}

      <main className="main">
        <section className="hero">
          <div>
            <span className="eyebrow">PAINEL DE VENDAS</span>

            <h1>
              Olá, <span>{usuario?.nome}</span> 👋
            </h1>

            <p>
              Gerencie seus produtos e realize suas vendas de forma simples.
            </p>
          </div>

          <div className="hero-date">
            <span>ESTOQUE DISPONÍVEL</span>
            <strong>{estoqueTotal}</strong>
            <small>unidades</small>
          </div>
        </section>

        <section className="stats">
          <div className="stat-card">
            <div className="stat-icon blue">▦</div>

            <div>
              <span>Produtos</span>
              <strong>{produtos.length}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>

            <div>
              <span>Em estoque</span>
              <strong>{estoqueTotal}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">🛒</div>

            <div>
              <span>No carrinho</span>
              <strong>{quantidadeCarrinho}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">R$</div>

            <div>
              <span>Total atual</span>
              <strong>R$ {total.toFixed(2)}</strong>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="products-section">
            <div className="section-header">
              <div>
                <span className="section-label">CATÁLOGO</span>
                <h2>Produtos</h2>
              </div>

              <div className="search-box">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="empty-products">
                <div>🔎</div>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente buscar por outro nome.</p>
              </div>
            ) : (
              <div className="products-grid">
                {produtosFiltrados.map((produto) => {
                  const itemCarrinho = carrinho.find(
                    (item) => item.produtoId === produto.id
                  );

                  const quantidadeAtual =
                    itemCarrinho?.quantidade || 0;

                  const semEstoque = produto.estoque <= 0;

                  return (
                    <article className="product-card" key={produto.id}>
                      <div className="product-top">
                        <div className="product-image">
                          {produto.nome.toLowerCase().includes("mouse")
                            ? "🖱️"
                            : produto.nome
                                .toLowerCase()
                                .includes("notebook")
                            ? "💻"
                            : "📦"}
                        </div>

                        {semEstoque ? (
                          <span className="stock-badge danger">
                            Sem estoque
                          </span>
                        ) : produto.estoque <= 5 ? (
                          <span className="stock-badge warning">
                            Últimas unidades
                          </span>
                        ) : (
                          <span className="stock-badge">
                            Disponível
                          </span>
                        )}
                      </div>

                      <div className="product-content">
                        <span className="product-id">
                          PRODUTO #{produto.id}
                        </span>

                        <h3>{produto.nome}</h3>

                        <div className="product-price">
                          <small>R$</small>
                          {produto.preco.toFixed(2)}
                        </div>

                        <div className="product-bottom">
                          <span>
                            {produto.estoque} unidades
                          </span>

                          <button
                            className="add-button"
                            onClick={() => adicionarCarrinho(produto)}
                            disabled={
                              semEstoque ||
                              quantidadeAtual >= produto.estoque
                            }
                          >
                            {quantidadeAtual > 0
                              ? `No carrinho (${quantidadeAtual})`
                              : "Adicionar +"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="cart-panel">
            <div className="cart-header">
              <div>
                <span className="section-label">PEDIDO ATUAL</span>

                <h2>
                  Seu carrinho
                  {quantidadeCarrinho > 0 && (
                    <span className="cart-count">
                      {quantidadeCarrinho}
                    </span>
                  )}
                </h2>
              </div>

              <span className="cart-icon">🛒</span>
            </div>

            {carrinho.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>

                <h3>Seu carrinho está vazio</h3>

                <p>
                  Adicione produtos para começar uma nova venda.
                </p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {carrinho.map((item) => (
                    <div className="cart-item" key={item.produtoId}>
                      <div className="cart-item-image">
                        {item.nome
                          .toLowerCase()
                          .includes("mouse")
                          ? "🖱️"
                          : item.nome
                              .toLowerCase()
                              .includes("notebook")
                          ? "💻"
                          : "📦"}
                      </div>

                      <div className="cart-item-main">
                        <div className="cart-item-title">
                          <strong>{item.nome}</strong>

                          <button
                            className="remove-button"
                            onClick={() =>
                              removerCarrinho(item.produtoId)
                            }
                          >
                            ×
                          </button>
                        </div>

                        <span>
                          R$ {item.preco.toFixed(2)} cada
                        </span>

                        <div className="cart-item-bottom">
                          <div className="quantity">
                            <button
                              onClick={() =>
                                diminuirQuantidade(item.produtoId)
                              }
                            >
                              −
                            </button>

                            <strong>{item.quantidade}</strong>

                            <button
                              onClick={() =>
                                aumentarQuantidade(item.produtoId)
                              }
                            >
                              +
                            </button>
                          </div>

                          <strong>
                            R${" "}
                            {(item.preco * item.quantidade).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>R$ {total.toFixed(2)}</strong>
                  </div>

                  <div>
                    <span>Desconto</span>
                    <strong>R$ 0,00</strong>
                  </div>

                  <div className="summary-total">
                    <span>Total</span>
                    <strong>R$ {total.toFixed(2)}</strong>
                  </div>

                  <button
                    className="finish-button"
                    onClick={finalizarVenda}
                    disabled={carregando}
                  >
                    {carregando
                      ? "Processando..."
                      : "Finalizar venda  →"}
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      </main>

      <footer className="footer">
        <span>© 2026 NovaTech Soluções</span>
        <span>Sistema de Gestão de Vendas</span>
      </footer>
    </div>
  );
}

export default App;