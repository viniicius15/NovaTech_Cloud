import { useState } from "react";
import NovoProduto from "./NovoProduto";

function Dashboard({
  usuario,
  logout,
  mensagem,
  tipoMensagem,
  busca,
  setBusca,
  produtosFiltrados,
  carrinho,
  quantidadeCarrinho,
  total,
  estoqueTotal,
  produtos,
  carregando,
  adicionarCarrinho,
  aumentarQuantidade,
  diminuirQuantidade,
  removerCarrinho,
  finalizarVenda,
  recarregarProdutos,
  mostrarMensagem,
}) {
  const [mostrarFormProduto, setMostrarFormProduto] = useState(false);

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

            <p>Gerencie seus produtos e realize suas vendas de forma simples.</p>
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

              <div className="section-header-actions">
                <div className="search-box">
                  <span>⌕</span>

                  <input
                    type="text"
                    placeholder="Buscar produto..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="add-button"
                  onClick={() => setMostrarFormProduto(true)}
                >
                  + Novo produto
                </button>
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

                  const quantidadeAtual = itemCarrinho?.quantidade || 0;

                  const semEstoque = produto.estoque <= 0;

                  return (
                    <article className="product-card" key={produto.id}>
                      <div className="product-top">
                        <div className="product-image">
                          {produto.nome.toLowerCase().includes("mouse")
                            ? "🖱️"
                            : produto.nome.toLowerCase().includes("notebook")
                            ? "💻"
                            : "📦"}
                        </div>

                        {semEstoque ? (
                          <span className="stock-badge danger">Sem estoque</span>
                        ) : produto.estoque <= 5 ? (
                          <span className="stock-badge warning">
                            Últimas unidades
                          </span>
                        ) : (
                          <span className="stock-badge">Disponível</span>
                        )}
                      </div>

                      <div className="product-content">
                        <span className="product-id">PRODUTO #{produto.id}</span>

                        <h3>{produto.nome}</h3>

                        <div className="product-price">
                          <small>R$</small>
                          {produto.preco.toFixed(2)}
                        </div>

                        <div className="product-bottom">
                          <span>{produto.estoque} unidades</span>

                          <button
                            className="add-button"
                            onClick={() => adicionarCarrinho(produto)}
                            disabled={
                              semEstoque || quantidadeAtual >= produto.estoque
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
                    <span className="cart-count">{quantidadeCarrinho}</span>
                  )}
                </h2>
              </div>

              <span className="cart-icon">🛒</span>
            </div>

            {carrinho.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>

                <h3>Seu carrinho está vazio</h3>

                <p>Adicione produtos para começar uma nova venda.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {carrinho.map((item) => (
                    <div className="cart-item" key={item.produtoId}>
                      <div className="cart-item-image">
                        {item.nome.toLowerCase().includes("mouse")
                          ? "🖱️"
                          : item.nome.toLowerCase().includes("notebook")
                          ? "💻"
                          : "📦"}
                      </div>

                      <div className="cart-item-main">
                        <div className="cart-item-title">
                          <strong>{item.nome}</strong>

                          <button
                            className="remove-button"
                            onClick={() => removerCarrinho(item.produtoId)}
                          >
                            ×
                          </button>
                        </div>

                        <span>R$ {item.preco.toFixed(2)} cada</span>

                        <div className="cart-item-bottom">
                          <div className="quantity">
                            <button
                              onClick={() => diminuirQuantidade(item.produtoId)}
                            >
                              −
                            </button>

                            <strong>{item.quantidade}</strong>

                            <button
                              onClick={() => aumentarQuantidade(item.produtoId)}
                            >
                              +
                            </button>
                          </div>

                          <strong>
                            R$ {(item.preco * item.quantidade).toFixed(2)}
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
                    {carregando ? "Processando..." : "Finalizar venda  →"}
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

      {mostrarFormProduto && (
        <NovoProduto
          mostrarMensagem={mostrarMensagem}
          onProdutoCriado={recarregarProdutos}
          onFechar={() => setMostrarFormProduto(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;