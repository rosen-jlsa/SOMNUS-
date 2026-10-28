import hero from '../assets/somnus-hero.jpg';
import detail from '../assets/somnus-detail.jpg';
import product from '../assets/somnus-product.jpg';

const principles = [
  { number: '01', title: 'A slower visual rhythm', text: 'Generous space and a restrained palette create a calm way into the page.' },
  { number: '02', title: 'Useful product context', text: 'Clear structure helps visitors understand the concept without relying on exaggerated claims.' },
  { number: '03', title: 'Made for a real theme', text: 'The matching Liquid section supports editable content and actual Shopify product data.' },
];

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="concept-bar">Independent Shopify design concept · No product is for sale here</div>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="SOMNUS, back to top">SOMNUS<span>®</span></a>
        <nav aria-label="Main navigation"><a href="#story">The idea</a><a href="#details">Design details</a><a href="#project">About the project</a></nav>
        <a className="header-link" href="#project">Explore concept <span aria-hidden="true">↗</span></a>
      </header>
      <main id="main">
        <section className="hero somnus-hero" id="top" aria-labelledby="hero-title">
          <div className="hero-art"><img src={hero} alt="Illustrative amber bottle in a soft evening setting" /><span className="image-caption">An atmosphere for the end of the day</span></div>
          <div className="hero-copy"><p className="eyebrow">01 / A wellness storefront concept</p><h1 id="hero-title">Make room<br />for <em>stillness.</em></h1><p className="lead">SOMNUS explores an unhurried product experience inspired by the quiet moments before nightfall.</p><a className="button" href="#story">Discover the concept <span aria-hidden="true">↗</span></a><p className="micro">Fictional brand and illustrative imagery. No health outcomes are claimed.</p></div>
        </section>
        <section className="intro section-pad" id="story"><p className="eyebrow">The design intention</p><div><h2>A softer way<br /><em>to explore.</em></h2><p>For this portfolio concept, the interface uses warm imagery, deliberate pacing and a simple reading path. The result feels composed without hiding the information that matters.</p></div></section>
        <section className="image-story" aria-label="Evening editorial imagery"><img src={detail} alt="Quiet bedroom with soft linen and evening light" loading="lazy" /><div><span className="eyebrow">The visual language</span><p>Light fades. Texture stays. Everything has space.</p></div></section>
        <section className="details section-pad" id="details"><div className="details-heading"><p className="eyebrow">A considered flow</p><h2>Calm, down<br /><em>to the details.</em></h2></div><div className="steps">{principles.map(item => <article className="step" key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></section>
        <section className="product-spotlight"><div className="product-image"><img src={product} alt="Illustrative SOMNUS amber bottle packaging" loading="lazy" /></div><div className="product-copy"><p className="eyebrow">The Shopify implementation</p><h2>Quiet design.<br /><em>Solid structure.</em></h2><p>Beyond the visual preview, this project includes a Shopify Liquid section. Merchants can edit its copy and images, while its product form uses Shopify data when assigned to a test product.</p><a className="text-link" href="#project">See the project notes <span aria-hidden="true">↗</span></a></div></section>
        <section className="project section-pad" id="project"><p className="eyebrow">Project notes</p><h2>A complete concept,<br /><em>honestly presented.</em></h2><div className="project-grid"><p>Responsive visual preview</p><p>Shopify Online Store 2.0 Liquid section</p><p>Merchant-editable product presentation</p></div><p className="disclaimer">SOMNUS is a fictional brand. This preview has no checkout, verified supplement information, clinical evidence or customer reviews.</p></section>
      </main>
      <footer><a className="wordmark" href="#top">SOMNUS<span>®</span></a><span>Shopify product page concept</span><a href="#top">Back to top ↑</a></footer>
    </>
  );
}
