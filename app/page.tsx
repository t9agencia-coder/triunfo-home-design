export default function Home() {
  return (
    <>
      <div className="announcement">
        FRETE GRÁTIS PARA TODO O BRASIL. VÁLIDO SÓ HOJE.
      </div>

      <header className="store-header">
        <div className="store-header-main container">
          <button className="header-icon-button" id="menu-button" type="button" aria-label="Abrir menu" aria-expanded="false">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>

          <a className="store-logo" href="/" aria-label="Triunfo Home Design - página inicial">
            <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" />
          </a>

          <nav className="header-actions" aria-label="Atalhos da loja">
            <button className="header-icon-button" type="button" aria-label="Minha conta" title="Minha conta">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M5 21v-2a7 7 0 0 1 14 0v2"></path>
              </svg>
            </button>
            <button className="header-icon-button header-location" type="button" aria-label="Informe sua localização" title="Localização">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path>
                <circle cx="12" cy="10" r="2.5"></circle>
              </svg>
            </button>
            <button className="header-icon-button header-cart-button" id="header-cart-button" type="button" aria-label="Abrir carrinho">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.5 8H6"></path>
                <circle cx="9.5" cy="20" r="1"></circle>
                <circle cx="17.5" cy="20" r="1"></circle>
              </svg>
              <span id="header-cart-count">0</span>
            </button>
          </nav>
        </div>

        <form className="store-search container" id="store-search" role="search">
          <label className="sr-only" htmlFor="store-search-input">Buscar na loja</label>
          <input id="store-search-input" type="search" placeholder="O que você está buscando?" autoComplete="off" />
          <button type="submit" aria-label="Buscar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7"></circle>
              <path d="m20 20-4-4"></path>
            </svg>
          </button>
        </form>

        <div className="header-menu" id="header-menu" hidden>
          <div className="container">
            <a href="#produto">Armário Multifuncional</a>
            <a href="#reviews-title">Avaliações</a>
            <a href=".faq-section">Perguntas frequentes</a>
          </div>
        </div>
      </header>

      <main>
        <section className="product-section" id="produto">
          <div className="product-layout container">
            <div dangerouslySetInnerHTML={{ __html: `
<script>
var __imgs=["/images/dYdvdqs6VrAy.png","/images/armario-2.png","/images/armario-3.png","/images/armario-4.png","/images/armario-5.png","/images/armario-6.png"];
var __idx=0;
function __go(i){__idx=i;var m=document.getElementById("main-product-image");if(m)m.src=__imgs[i];var t=document.querySelectorAll("#thumbnails .thumbnail");for(var j=0;j<t.length;j++){t[j].className=t[j].className.replace(" active","");}if(t[i])t[i].className+=" active";}
function __prev(){__go(__idx===0?__imgs.length-1:__idx-1);}
function __next(){__go((__idx+1)%__imgs.length);}
</script>
<p class="breadcrumb gallery-breadcrumb">Casa / Organiza\u00e7\u00e3o / Arm\u00e1rios</p>
<div class="gallery-main">
<img id="main-product-image" src="/images/dYdvdqs6VrAy.png" alt="Arm\u00e1rios FlexHome grafite e branco" />
<span class="badge badge-accent">Frete gr\u00e1tis</span>
<button class="gallery-arrow gallery-prev" id="gallery-prev" onclick="__prev()" aria-label="Imagem anterior"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg></button>
<button class="gallery-arrow gallery-next" id="gallery-next" onclick="__next()" aria-label="Pr\u00f3xima imagem"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></button>
</div>
<div class="thumbnails" id="thumbnails" aria-label="Fotos do produto">
<button type="button" class="thumbnail active" onclick="__go(0)" aria-label="Arm\u00e1rios FlexHome grafite e branco"><img src="/images/dYdvdqs6VrAy.png" alt="" /></button>
<button type="button" class="thumbnail" onclick="__go(1)" aria-label="Arm\u00e1rio FlexHome \u2014 foto 2"><img src="/images/armario-2.png" alt="" /></button>
<button type="button" class="thumbnail" onclick="__go(2)" aria-label="Arm\u00e1rio FlexHome \u2014 foto 3"><img src="/images/armario-3.png" alt="" /></button>
<button type="button" class="thumbnail" onclick="__go(3)" aria-label="Arm\u00e1rio FlexHome \u2014 foto 4"><img src="/images/armario-4.png" alt="" /></button>
<button type="button" class="thumbnail" onclick="__go(4)" aria-label="Arm\u00e1rio FlexHome \u2014 foto 5"><img src="/images/armario-5.png" alt="" /></button>
<button type="button" class="thumbnail" onclick="__go(5)" aria-label="Arm\u00e1rio FlexHome \u2014 foto 6"><img src="/images/armario-6.png" alt="" /></button>
</div>
` }} suppressHydrationWarning />

            <div className="product-info">
              <h1>FlexHome - Armário Multifuncional</h1>
              <p className="subtitle product-offer">[PAGUE 1 LEVE 2]</p>

              <div className="rating">
                <span className="stars" aria-label="5 estrelas">★★★★★</span>
                <strong>4.8</strong>
                <span>(3,6 mil avaliações · 15,9 mil vendidos)</span>
              </div>

              <fieldset className="option-group">
                <legend>Oferta selecionada:</legend>
                <button className="special-offer" id="special-offer-toggle" type="button" aria-expanded="true">
                  <span className="special-offer-badge">OFERTA ESPECIAL</span>
                  <span className="special-offer-copy">
                    <strong>Pague 1 e leve 2 armários</strong>
                    <small>Selecione as cores dos seus armários</small>
                  </span>
                  <span className="special-offer-price">
                    <s>R$ 219,80</s>
                    <b>R$ 109,90</b>
                  </span>
                  <span className="special-offer-arrow" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m7 9 5 5 5-5"></path>
                    </svg>
                  </span>
                </button>
                <div className="offer-color-selector" id="offer-color-selector">
                  <label htmlFor="variant-select">Escolha as cores:</label>
                  <select id="variant-select">
                    <option value="2 Pretos">2 Pretos</option>
                    <option value="2 Brancos">2 Brancos</option>
                    <option value="1 Preto e 1 Branco">1 Preto e 1 Branco</option>
                  </select>
                </div>
              </fieldset>

              <div className="price-block">
                <s>R$ 219,80</s>
                <strong id="current-price">R$ 109,90</strong>
                <span>50% OFF</span>
              </div>
              <p className="price-savings">💰 Você economiza <strong>R$ 109,90</strong> nesta oferta</p>

              <div className="product-actions">
                <button className="button button-primary button-large" id="buy-now">COMPRAR AGORA</button>
              </div>

              <div className="shipping-calc">
                <label htmlFor="cep-calc">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h13V6H3v7Zm13 0 3-4h2l1 4v3h-6"></path><circle cx="7" cy="17" r="2"></circle><circle cx="18" cy="17" r="2"></circle></svg>
                  Calcular frete e prazo de entrega
                </label>
                <div className="shipping-calc-row">
                  <input id="cep-calc" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="Digite seu CEP" maxLength={9} />
                  <button type="button" id="cep-calc-btn">Calcular</button>
                </div>
                <a className="shipping-calc-help" href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer">Não sei meu CEP</a>
                <div className="shipping-calc-result" id="shipping-result" hidden />
              </div>

              <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var res = document.getElementById("shipping-result");
  if (!res) return;
  function strip(v){return String(v||"").replace(/\\D/g,"");}
  function show(h,t){
    res.innerHTML = h;
    res.className = res.className.replace(/\\bis-(\\w+)\\b/g,"");
    res.classList.add(t==="error"?"is-error":"is-success");
    res.hidden = false;
  }
  document.addEventListener("input",function(e){
    if(e.target.id!=="cep-calc")return;
    var raw = strip(e.target.value).slice(0,8);
    e.target.value = raw.replace(/^(\\d{5})(\\d)/,"$1-$2");
  });
  document.addEventListener("keydown",function(e){
    if(e.target.id!=="cep-calc"||e.key!=="Enter")return;
    document.getElementById("cep-calc-btn").click();
  });
  document.addEventListener("click",function(e){
    if(e.target.id!=="cep-calc-btn")return;
    var inp = document.getElementById("cep-calc");
    var cep = strip(inp?inp.value:"");
    if(cep.length!==8){show("Digite um CEP v\u00e1lido com 8 d\u00edgitos.","error");return;}
    var btn = e.target;
    btn.disabled=true; btn.textContent="...";
    show("Consultando...","success");
    var x=new XMLHttpRequest();
    var to=setTimeout(function(){x.abort();},6000);
    x.open("GET","https://viacep.com.br/ws/"+cep+"/json/",true);
    x.onload=function(){clearTimeout(to);btn.disabled=false;btn.textContent="Calcular";
      try{var d=JSON.parse(x.responseText),l=(!d.erro&&d.localidade)?d.localidade+(d.uf?" - "+d.uf:""):"";show("<span class=\"ship-free\">\u2713 FRETE GR\u00c1TIS</span> "+(l?"para <strong>"+l+"</strong>":"para o seu endere\u00e7o")+"<br>Entrega estimada em <strong>3 a 6 dias \u00fateis</strong>.","success");}catch(e){show("<span class=\"ship-free\">\u2713 FRETE GR\u00c1TIS</span> para o seu endere\u00e7o<br>Entrega estimada em <strong>3 a 6 dias \u00fateis</strong>.","success");}};
    x.onerror=function(){clearTimeout(to);btn.disabled=false;btn.textContent="Calcular";show("<span class=\"ship-free\">\u2713 FRETE GR\u00c1TIS</span> para o seu endere\u00e7o<br>Entrega estimada em <strong>3 a 6 dias \u00fateis</strong>.","success");};
    x.send();
  });
})();
`}} suppressHydrationWarning />

              <div className="purchase-guarantees">
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                  </svg>
                  <span><strong>Compra Garantida</strong> — satisfação ou seu dinheiro de volta</span>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20 7v5h-5"></path>
                    <path d="M4 17v-5h5"></path>
                    <path d="M6.1 9A7 7 0 0 1 18 6l2 1M4 17l2 1a7 7 0 0 0 11.9-3"></path>
                  </svg>
                  <span><strong>Troca Grátis</strong> — 7 dias para trocas e devoluções</span>
                </div>
                <div>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="5"></circle>
                    <path d="m8.5 12-1 9 4.5-2 4.5 2-1-9"></path>
                  </svg>
                  <span><strong>RA 1000</strong> — Loja bem avaliada no Reclame Aqui</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="marquee-strip" role="presentation" aria-hidden="true">
          <div className="marquee-track">
            <div className="marquee-group">
              <span className="marquee-item">🗄️ ECONOMIZE ESPAÇO</span>
              <span className="marquee-sep">✦</span>
              <span className="marquee-item">🚚 FRETE GRÁTIS BRASIL</span>
              <span className="marquee-sep">✦</span>
              <span className="marquee-item">⭐ +8.421 AVALIAÇÕES</span>
              <span className="marquee-sep">✦</span>
            </div>
            <div className="marquee-group">
              <span className="marquee-item">🗄️ ECONOMIZE ESPAÇO</span>
              <span className="marquee-sep">✦</span>
              <span className="marquee-item">🚚 FRETE GRÁTIS BRASIL</span>
              <span className="marquee-sep">✦</span>
              <span className="marquee-item">⭐ +8.421 AVALIAÇÕES</span>
              <span className="marquee-sep">✦</span>
            </div>
          </div>
        </div>

        <section className="product-description section" aria-labelledby="description-title">
          <div className="container description-container">
            <h2 id="description-title">Descrição do produto</h2>
            <div className="description-images">
              <video autoPlay muted loop playsInline preload="metadata" aria-label="Apresentação do armário FlexHome">
                <source src="/media/zQKHLotld6L7.mp4" type="video/mp4" />
              </video>
              <img src="/images/MAZluCrCvzoN.png" alt="Armário multifuncional com proteção contra poeira e estrutura reforçada" loading="lazy" />
              <img src="/images/50jgQ9aM95Kz.png" alt="Armário com grande capacidade e organização para o dia a dia" loading="lazy" />
              <img src="/images/vyyH3SCjHWTz.png" alt="Medidas e opções de tamanho do armário" loading="lazy" />
            </div>
          </div>
        </section>

        <section className="reviews-section section" aria-labelledby="reviews-title">
          <div className="container reviews-container">
            <h2 id="reviews-title">Avaliações</h2>

            <div className="reviews-summary">
              <div className="reviews-score">
                <strong>4.8</strong>
                <div className="review-stars" aria-label="4,8 de 5 estrelas">★★★★★</div>
                <span>1.327 avaliações</span>
              </div>

              <div className="rating-distribution" aria-label="Distribuição das avaliações">
                <div className="rating-row">
                  <b>5</b>
                  <span className="rating-track"><i style={{ width: "85.38%" }}></i></span>
                  <small>1.133</small>
                </div>
                <div className="rating-row">
                  <b>4</b>
                  <span className="rating-track"><i style={{ width: "2.41%" }}></i></span>
                  <small>32</small>
                </div>
                <div className="rating-row">
                  <b>3</b>
                  <span className="rating-track"><i style={{ width: "1.73%" }}></i></span>
                  <small>23</small>
                </div>
                <div className="rating-row">
                  <b>2</b>
                  <span className="rating-track"><i style={{ width: "1%" }}></i></span>
                  <small>3</small>
                </div>
                <div className="rating-row">
                  <b>1</b>
                  <span className="rating-track"><i style={{ width: "1%" }}></i></span>
                  <small>3</small>
                </div>
              </div>
            </div>

            <div className="reviews-column">
              <article className="review-card">
                <header className="review-author">
                  <span className="review-avatar">ML</span>
                  <div>
                    <strong>Mariana L.</strong>
                    <small>Compra verificada · FlexHome</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Confesso que tinha receio de comprar online por causa da promoção "pague 1 leve 2", achei que fosse golpe. Mas chegaram OS DOIS armários certinhos em 4 dias úteis. A montagem é super fácil, levei uns 25 minutos cada. O aço é bem grosso, nada balança. Vale cada centavo!</p>
                <div className="review-photo">
                  <img src="/images/Y02lszuNP9rb.png" alt="Armário FlexHome recebido por Mariana" loading="lazy" />
                  <span>1/1</span>
                </div>
                <div className="review-verified">✓ Compra verificada</div>
              </article>

              <article className="review-card">
                <header className="review-author">
                  <span className="review-avatar">CH</span>
                  <div>
                    <strong>Carlos H.</strong>
                    <small>Compra verificada · FlexHome</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Comprei pra minha esposa que vive reclamando de organização da cozinha. Ela ficou IMPRESSIONADA. Cabe panelas, potes, eletroportáteis... ainda sobrou espaço. As portas com vidro deslizante são lindas e a iluminação interna dá um charme à parte. Recomendo de olhos fechados.</p>
                <div className="review-photo">
                  <img src="/images/CYmlWF5u4uG4.png" alt="Armário FlexHome recebido por Carlos" loading="lazy" />
                  <span>1/1</span>
                </div>
                <div className="review-verified">✓ Compra verificada</div>
              </article>

              <article className="review-card">
                <header className="review-author">
                  <span className="review-avatar">JS</span>
                  <div>
                    <strong>Juliana S.</strong>
                    <small>Compra verificada · FlexHome</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Que achado! Paguei por um e vieram dois mesmo, igual no anúncio. Coloquei um na cozinha e outro no quarto das crianças para os brinquedos. Organização total, entrega rápida (3 dias) e embalagem super segura. Recomendo demais! Já indiquei pra três amigas.</p>
                <div className="review-photo">
                  <img src="/images/xWMHXocgqr4n.png" alt="Armário FlexHome recebido por Juliana" loading="lazy" />
                  <span>1/1</span>
                </div>
                <div className="review-verified">✓ Compra verificada</div>
              </article>

              <article className="review-card">
                <header className="review-author">
                  <span className="review-avatar">RM</span>
                  <div>
                    <strong>Roberto M.</strong>
                    <small>Compra verificada · FlexHome</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Pesquisei em vários lugares e o frete grátis aqui foi o que me convenceu — em outro site sai por mais de 250 só um, aqui paguei menos da metade pelos dois. Aguenta bem o peso (coloquei microondas, sanduicheira, liquidificador) e os pés ajustáveis ajudam em piso desnivelado. Produto sério.</p>
                <div className="review-photo">
                  <img src="/images/0BAbaiyrE8yj.png" alt="Armário FlexHome recebido por Roberto" loading="lazy" />
                  <span>1/1</span>
                </div>
                <div className="review-verified">✓ Compra verificada</div>
              </article>

              <article className="review-card">
                <header className="review-author">
                  <span className="review-avatar">PG</span>
                  <div>
                    <strong>Patrícia G.</strong>
                    <small>Compra verificada · FlexHome</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Apartamento pequeno e essa foi a melhor solução que achei. Ocupa pouco espaço de chão e tem bastante volume interno. Acabei usando como armário de varanda também — não enferruja porque o aço é tratado. Ótimo acabamento, parece muito mais caro do que é.</p>
                <div className="review-photo">
                  <img src="/images/ngAU2b3lgN2H.png" alt="Armário FlexHome recebido por Patrícia" loading="lazy" />
                  <span>1/1</span>
                </div>
                <div className="review-verified">✓ Compra verificada</div>
              </article>

              <article className="review-card">
                <header className="review-author">
                  <span className="review-avatar">TN</span>
                  <div>
                    <strong>Thiago N.</strong>
                    <small>Compra verificada · FlexHome</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Tava na dúvida porque era promoção meio "boa demais". Comprei mesmo assim e foi a melhor decisão. Os dois armários chegaram em perfeito estado, frete grátis cumprido, suporte respondeu rápido quando perguntei sobre prazo. Empilhei dois no escritório, ficou show de bola.</p>
                <div className="review-photo">
                  <img src="/images/6bgSK5cU7TVB.png" alt="Armários FlexHome recebidos por Thiago" loading="lazy" />
                  <span>1/1</span>
                </div>
                <div className="review-verified">✓ Compra verificada</div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">MA</span>
                  <div>
                    <strong>Marcos Almeida</strong>
                    <small>Resumo traduzido · Amazon · Branco</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Muito útil, fácil de montar e com uma cor bonita. Guarda bastante coisa, combina bem com o quarto e deixou o dia a dia mais prático. Eu recomendaria para outras pessoas.</p>
                <div className="review-photo review-photo-gallery" aria-label="3 fotos da avaliação do Marcos Almeida">
                  <img src="/images/5wtP9hhJHqTI.jpg" alt="Armário fotografado pelo Marcos Almeida" loading="lazy" />
                  <img src="/images/RKEchpvyTEKm.jpg" alt="Detalhe do armário fotografado pelo Marcos Almeida" loading="lazy" />
                  <img src="/images/mOT2rg6nLsgP.jpg" alt="Armário organizado pelo Marcos Almeida" loading="lazy" />
                </div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">PS</span>
                  <div>
                    <strong>Patrícia Souza</strong>
                    <small>Resumo traduzido · Amazon · Preto</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Gostei muito. Há bastante espaço para guardar nossas coisas e a montagem foi fácil. Ficou no tamanho certo para o quarto e parece muito funcional.</p>
                <div className="review-photo review-photo-gallery" aria-label="2 fotos da avaliação do Patrícia Souza">
                  <img src="/images/6kDMSuBenz8F.jpg" alt="Armário montado pelo Patrícia Souza" loading="lazy" />
                  <img src="/images/yNX5PNzV10ln.jpg" alt="Armário organizado pelo Patrícia Souza" loading="lazy" />
                </div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">RO</span>
                  <div>
                    <strong>Rodrigo Oliveira</strong>
                    <small>Resumo traduzido · Amazon · Preto</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Ideal para vários ambientes da casa. É fácil de montar, firme e a estrutura metálica suporta bastante peso. A porta deslizante é um diferencial e o custo-benefício é ótimo.</p>
                <div className="review-photo review-photo-gallery" aria-label="2 fotos da avaliação do Rodrigo Oliveira">
                  <img src="/images/m0ouVDa7S3ix.jpg" alt="Armário utilizado pelo Rodrigo Oliveira" loading="lazy" />
                  <img src="/images/bpCVa11Cf2M1.jpg" alt="Detalhe interno do armário do Rodrigo Oliveira" loading="lazy" />
                </div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">FL</span>
                  <div>
                    <strong>Fernanda Lima</strong>
                    <small>Resumo traduzido · Amazon · Preto</small>
                  </div>
                  <div className="review-stars" aria-label="4 estrelas">★★★★☆</div>
                </header>
                <p>Usei na minha pequena padaria para proteger os pães nas entregas da varanda. Resolveu bem e teve preço razoável. A montagem foi fácil, embora os puxadores tenham dado trabalho e os parafusos prateados parecessem simples.</p>
                <div className="review-photo">
                  <img src="/images/O261qjNaq23v.jpg" alt="Armário usado pelo Fernanda Lima" loading="lazy" />
                  <span>1/1</span>
                </div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">LP</span>
                  <div>
                    <strong>Lucas Pereira</strong>
                    <small>Resumo traduzido · Amazon · Preto</small>
                  </div>
                  <div className="review-stars" aria-label="3 estrelas">★★★☆☆</div>
                </header>
                <p>O armário é bonito, porém as portas vieram sem os suportes que mantêm os painéis no lugar. O fabricante não tinha as peças necessárias e também não ofereceu portas de reposição.</p>
                <div className="review-photo">
                  <img src="/images/ZcCcBAK581jB.jpg" alt="Problema na porta registrado pelo Lucas Pereira" loading="lazy" />
                  <span>1/1</span>
                </div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">JC</span>
                  <div>
                    <strong>Juliana Costa</strong>
                    <small>Resumo traduzido · Amazon · Preto</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Bonito e fácil de instalar. Dá para guardar bastante coisa e as portas escondem o conteúdo, deixando o ambiente mais organizado e com uma aparência limpa.</p>
                <div className="review-photo">
                  <img src="/images/xFuTXGhJqncO.jpg" alt="Armário organizado pelo Juliana Costa" loading="lazy" />
                  <span>1/1</span>
                </div>
              </article>

              <article className="review-card review-card-external">
                <header className="review-author">
                  <span className="review-avatar">BC</span>
                  <div>
                    <strong>Bruno Carvalho</strong>
                    <small>Resumo traduzido · Amazon · Preto</small>
                  </div>
                  <div className="review-stars" aria-label="5 estrelas">★★★★★</div>
                </header>
                <p>Montagem simples e boa qualidade. Eu precisava de espaço extra em uma cozinha pequena, e a porta basculante funcionou bem sem ocupar espaço ao abrir.</p>
                <div className="review-photo">
                  <img src="/images/UUxXzKgzlhRP.jpg" alt="Armário instalado pelo Bruno Carvalho" loading="lazy" />
                  <span>1/1</span>
                </div>
              </article>
            </div>

            <nav className="reviews-pagination" id="reviews-pagination" aria-label="Navegação das avaliações"></nav>
          </div>
        </section>

        <section className="about-section section" id="sobre-nos">
          <div className="container">
            <div className="about-grid">
              <div className="about-media">
                <img src="/images/O2XU0PdRLQL8.png" alt="Equipe da Triunfo Home Design no centro de distribuição" loading="lazy" />
              </div>
              <div className="about-content">
                <p className="eyebrow">QUEM SOMOS</p>
                <h2 className="about-title">Sobre a Triunfo Home Design</h2>
                <p className="about-lead">
                  Somos uma loja brasileira de móveis e soluções de organização
                  para deixar a sua casa mais funcional e aconchegante.
                </p>
                <details className="about-more">
                  <summary>
                    <span className="about-more-label">Ver mais</span>
                    <svg className="about-more-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </summary>
                  <div className="about-more-content">
                    <p>
                      Nascemos com um objetivo simples: levar produtos de qualidade,
                      com preço justo e um atendimento que trata cada cliente como
                      gente — e não como número.
                    </p>
                    <p>
                      Cuidamos de tudo, da escolha dos fornecedores ao embalo de cada
                      pedido. Nosso estoque é próprio e o despacho é rápido, porque
                      sabemos que quando você compra algo para o seu lar, a
                      expectativa bate na porta junto com a encomenda.
                    </p>
                    <ul className="about-highlights">
                      <li>
                        <strong>+15 mil</strong>
                        <span>clientes atendidos em todo o Brasil</span>
                      </li>
                      <li>
                        <strong>Envio rápido</strong>
                        <span>despacho em até 24h após a confirmação</span>
                      </li>
                      <li>
                        <strong>Compra segura</strong>
                        <span>site protegido e suporte humano de verdade</span>
                      </li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section section">
          <div className="container narrow">
            <p className="eyebrow centered">TIRE SUAS DÚVIDAS</p>
            <h2>Perguntas frequentes</h2>
            <div className="faq-list">
              <details><summary>É difícil de montar?</summary><p>Não. A montagem é simples e leva poucos minutos. O armário acompanha todas as peças, parafusos e um manual ilustrado passo a passo.</p></details>
              <details><summary>O armário é resistente? Aguenta peso?</summary><p>Sim. A estrutura é em aço reforçado e as prateleiras suportam bastante peso, mantendo tudo firme e estável no dia a dia.</p></details>
              <details><summary>Serve para quais ambientes?</summary><p>É multifuncional: funciona muito bem no quarto, cozinha, lavanderia, banheiro ou área de serviço. As portas protegem o conteúdo da poeira.</p></details>
              <details><summary>Qual é o prazo de entrega?</summary><p>O despacho ocorre em até 24 horas úteis. O prazo de entrega costuma variar de 3 a 10 dias úteis, conforme a sua região.</p></details>
              <details><summary>Tem garantia?</summary><p>Sim. Você tem 7 dias de garantia de satisfação após o recebimento, além da garantia contra defeitos de fabricação.</p></details>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-content container">
          <section className="footer-brand">
            <div className="store-logo">
              <img src="/images/oILg2cf6VMfI.png" alt="Triunfo Home Design" />
            </div>
            <h2>Triunfo Home Design</h2>
            <p>Soluções práticas para organização, conforto e funcionalidade dentro da sua casa.</p>
          </section>

          <section className="footer-section">
            <h3>Informações</h3>
            <nav>
              <a href="sobre-nos.html">Sobre nós</a>
              <a href="politica-de-privacidade.html">Política de privacidade</a>
              <a href="politica-de-devolucao.html">Política de devolução</a>
              <a href="politica-de-frete.html">Política de frete</a>
              <a href="contato.html">Contato</a>
            </nav>
          </section>

          <section className="footer-section">
            <h3>Localização</h3>
            <p className="footer-line">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>
              <span>Atendimento online para todo o Brasil</span>
            </p>
            <p className="footer-line">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
              <span>Seg–Sex: 8h às 18h</span>
            </p>
          </section>

          <section className="footer-section">
            <h3>Contato</h3>
            <p className="footer-line">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h3l1 5-2 1c1.2 2.6 3.4 4.8 6 6l1-2 5 1v3c0 2.2-1.8 4-4 4C9.3 21 3 14.7 3 7c0-2.2 1.8-4 4-4Z"></path></svg>
              <span>Atendimento pelo WhatsApp</span>
            </p>
            <p className="footer-line">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m4 7 8 6 8-6"></path></svg>
              <span>contato@lojaflexhomes.com.br</span>
            </p>
          </section>
        </div>

        <div className="footer-bottom container">
          <span>Compra protegida por criptografia SSL.</span>
          <small>© <span id="footer-year"></span> Triunfo Home Design. Todos os direitos reservados.</small>
        </div>

        <div className="payment-icons container" aria-label="Formas de pagamento aceitas">
          <img src="/images/ZevbLkVeF2gs.svg" alt="Amex" width="39" height="26" />
          <img src="/images/ArGWVJHpgYvU.svg" alt="Visa" width="39" height="26" />
          <img src="/images/0ovYmYCaKmvG.svg" alt="Diners Club" width="39" height="26" />
          <img src="/images/q0kdVVG0rtRH.svg" alt="Mastercard" width="39" height="26" />
          <img src="/images/pYoM0lYcIBRp.svg" alt="Discover" width="39" height="26" />
          <img src="/images/R8kYc3JGxQCa.svg" alt="Aura" width="39" height="26" />
          <img src="/images/PSdsna7V1PGI.svg" alt="Elo" width="39" height="26" />
          <img src="/images/fGHGNLPt08me.svg" alt="Hiper" width="39" height="26" />
          <img src="/images/9zS7PqYNCPfs.svg" alt="Pix" width="39" height="26" />
        </div>
      </footer>

      <div className="sticky-purchase" id="sticky-purchase" aria-hidden="true">
        <div className="container">
          <div><strong>FlexHome - Armário Multifuncional</strong><span><s>R$ 219,80</s> R$ 109,90</span></div>
          <button className="button button-primary" id="sticky-buy">COMPRAR AGORA</button>
        </div>
      </div>

      <div className="cart-layer" id="cart-layer" aria-hidden="true">
        <button className="cart-backdrop" id="cart-backdrop" aria-label="Fechar carrinho"></button>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
          <header>
            <h2 id="cart-title">Seu carrinho <span id="cart-count">(0)</span></h2>
            <button className="icon-button" id="close-cart" aria-label="Fechar carrinho">×</button>
          </header>
          <div className="cart-items" id="cart-items"></div>
          <footer id="cart-footer">
            <div><span>Total</span><strong id="cart-total">R$ 0,00</strong></div>
            <button className="button button-primary button-large" id="cart-checkout">FINALIZAR COMPRA</button>
          </footer>
        </aside>
      </div>

      <div className="toast" id="toast" role="status" aria-live="polite"></div>
      <script src="/js/AxVL7LwBujgu.js?v=3" defer></script>
      <script src="/js/yFVPl407oWCP.js?v=3" defer></script>
    </>
  );
}
