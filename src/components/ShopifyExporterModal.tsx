import React, { useState } from 'react';
import { X, Copy, Download, Check, Sparkles, BookOpen, AlertCircle, Cpu, Sliders } from 'lucide-react';

interface ShopifyExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig: {
    citationsEnabled: boolean;
    freeShippingThreshold: number;
    showHypeBanner: boolean;
    glowAuraIntensity: 'none' | 'soft' | 'radiant';
    fontScaling: 'normal' | 'large';
    cartProgressNote: string;
  };
}

export default function ShopifyExporterModal({ isOpen, onClose, themeConfig }: ShopifyExporterModalProps) {
  const [activeTab, setActiveTab] = useState<'liquid' | 'css' | 'schema' | 'guide'>('liquid');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Real, structured Shopify Online Store 2.0 theme section in clinical Liquid format
  const liquidCode = `{% comment %}
  SOMNUS Circadian Rest System - Section Template optimized for Shrine Theme & Shopify Online Store 2.0
  Created live from SOMNUS Designer Workspace.
{% endcomment %}

{{ 'somnus-shrine-custom.css' | asset_url | stylesheet_tag }}

<section id="shopify-section-{{ section.id }}" class="somnus-main-product-wrapper intensity-{{ section.settings.glow_aura_intensity }}">
  
  {% if section.settings.show_hype_banner %}
    <div class="somnus-hype-banner">
      <div class="somnus-container">
        <span>🌙 CLINICAL Rest sequence OVERRIDE: ORDER WITHIN NEXT 4 HOURS TO SHIP TOMORROW</span>
      </div>
    </div>
  {% endif %}

  <div class="somnus-grid somnus-container">
    {% comment %} Left Column - Media Gallery {% endcomment %}
    <div class="somnus-gallery-col">
      <div class="somnus-main-image-viewport">
        <img src="{{ product.featured_image | img_url: '1024x1024' }}" alt="{{ product.title | escape }}" id="SomnusMainFeaturedImage">
        <span class="somnus-badge">Circadian Safe</span>
      </div>
      
      <div class="somnus-thumbnails-row">
        {% for image in product.images %}
          <button class="somnus-thumbnail {% if forloop.first %}active{% endif %}" data-src="{{ image | img_url: '1024x1024' }}">
            <img src="{{ image | img_url: '120x120' }}" alt="Thumb">
          </button>
        {% endfor %}
      </div>

      {% comment %} Shrine Compact Benefits Stack {% endcomment %}
      <div class="somnus-responsive-benefits-display">
        <div class="somnus-benefit-card">
          <span class="somnus-icon">🌙</span>
          <div class="somnus-benefit-content">
            <h4>CIRCADIAN PHASE SYNCHRONIZATION</h4>
            <p>Optimizes sleep latency and baseline resting HRV metrics.</p>
          </div>
        </div>
        <div class="somnus-benefit-card">
          <span class="somnus-icon">🛡️</span>
          <div class="somnus-benefit-content">
            <h4>UNCOMPROMISING ASSAY PURITY</h4>
            <p>100% triple HPLC certified pure botanical extracts.</p>
          </div>
        </div>
      </div>
    </div>

    {% comment %} Right Column - Shopify Buy Box {% endcomment %}
    <div class="somnus-buybox-col">
      <div class="somnus-badge-row">
        <span class="badge-neuro">🧠 NEUROSCIENTIST FORMULATED</span>
        <span class="badge-assay">🧪 100% CLINICAL ASSAY</span>
      </div>

      <span class="somnus-sub-tag border-sand">{{ section.settings.sub_title }}</span>
      <h1 class="somnus-product-title">{{ product.title }}</h1>
      
      {% comment %} Dynamic custom pricing toggles %}{% endcomment %}
      <div class="somnus-pricing-box">
        <div class="somnus-price-row">
          <span class="somnus-current-price">$68.00</span>
          <span class="somnus-old-price">$85.00</span>
          <span class="somnus-savings">Save 20%</span>
        </div>
      </div>

      <div class="somnus-form-box">
        {% form 'product', product %}
          <input type="hidden" name="id" value="{{ product.selected_or_first_available_variant.id }}">
          
          <div class="somnus-radio-selector active">
            <label class="somnus-radio-label">
              <input type="radio" name="purchase_type" value="subscribe" checked>
              <div class="somnus-label-data">
                <span class="mode-name">Subscribe & Save (Save 20%)</span>
                <span class="mode-price">$68.00 / month</span>
              </div>
            </label>
          </div>

          <div class="somnus-radio-selector">
            <label class="somnus-radio-label">
              <input type="radio" name="purchase_type" value="onetime">
              <div class="somnus-label-data">
                <span class="mode-name">One-time Clinical Batch purchase</span>
                <span class="mode-price">$85.00</span>
              </div>
            </label>
          </div>

          {% if section.settings.free_shipping_threshold %}
            <div class="somnus-free-shipping-indicator">
              <p>You qualify for <strong>FREE EXPRESS SHIPPING</strong>! Worldwide dispatch.</p>
            </div>
          {% endif %}

          <button type="submit" class="somnus-add-to-cart-btn btn-shrine-custom">
            <span>INSTANTLY ADD TO BAG</span>
          </button>
        {% endform %}
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "SOMNUS Shrine Buy Box",
  "settings": [
    {
      "type": "text",
      "id": "sub_title",
      "label": "Over-Title Tag",
      "default": "ST-09 CIRCADIAN CONCENTRATE"
    },
    {
      "type": "checkbox",
      "id": "show_hype_banner",
      "label": "Show Urgency Shipping Banner",
      "default": true
    },
    {
      "type": "range",
      "id": "free_shipping_threshold",
      "label": "Free Shipping Limit ($)",
      "min": 50,
      "max": 150,
      "default": 75
    },
    {
      "type": "select",
      "id": "glow_aura_intensity",
      "label": "Rest Glow Ambient Effect",
      "options": [
        { "value": "none", "label": "None" },
        { "value": "soft", "label": "Soft Ambient Sand" },
        { "value": "radiant", "label": "Radiant Amber" }
      ],
      "default": "soft"
    }
  ],
  "presets": [
    {
      "name": "SOMNUS Shrine Buy Box",
      "category": "Product Pages"
    }
  ]
}
{% endschema %}`;

  const cssCode = `/* somnus-shrine-custom.css
 * Core visual theme styling for Shopify Liquid sections
 * Matching beautiful Minimalist sand and midnight tones
 */
.somnus-main-product-wrapper {
  background-color: #F9F6F0 !important; /* Soft sand off-white chalk */
  color: #11141A !important; /* Deep luxury charcoal midnight */
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  padding: 40px 0;
  border-bottom: 1px solid rgba(17, 20, 26, 0.1);
}

.somnus-main-product-wrapper.intensity-soft {
  box-shadow: inset 0 0 100px rgba(220, 205, 178, 0.2);
}

.somnus-main-product-wrapper.intensity-radiant {
  box-shadow: inset 0 0 150px rgba(220, 205, 178, 0.45);
}

.somnus-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
}

.somnus-hype-banner {
  background-color: #DCCDB2; /* Brand sand color */
  color: #11141A;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 10px;
  padding: 8px 0;
  text-align: center;
  margin-bottom: 24px;
}

.somnus-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 50px;
}

@media (max-width: 768px) {
  .somnus-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
}

.somnus-main-image-viewport {
  position: relative;
  background-color: #FFFFFF;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(17, 20, 26, 0.05);
}

.somnus-main-image-viewport img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
}

.somnus-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #11141A;
  color: #DCCDB2;
  font-size: 8px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 1.5px;
  padding: 4px 10px;
  border-radius: 4px;
}

.somnus-thumbnails-row {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.somnus-thumbnail {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  border: 1px solid rgba(17, 20, 26, 0.1);
  background: #FFFFFF;
  padding: 3px;
  cursor: pointer;
}

.somnus-thumbnail.active {
  border-color: #11141A;
  box-shadow: 0 0 0 2px #DCCDB2;
}

.somnus-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* Fix mobile stacked benefits under gallery display dynamically */
.somnus-responsive-benefits-display {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid rgba(17, 20, 26, 0.08);
  padding-top: 20px;
}

@media (min-width: 480px) {
  .somnus-responsive-benefits-display {
    grid-template-columns: 1fr 1fr;
  }
}

.somnus-benefit-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: #FFFFFF;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(17, 20, 26, 0.05);
}

.somnus-benefit-card .somnus-icon {
  font-size: 16px;
}

.somnus-benefit-content h4 {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #11141A;
  margin: 0 0 4px 0;
}

.somnus-benefit-content p {
  font-size: 10px;
  color: rgba(17, 20, 26, 0.75);
  margin: 0;
  line-height: 1.4;
}

.somnus-add-to-cart-btn {
  width: 100%;
  background: #11141A !important;
  color: #DCCDB2 !important;
  font-weight: 800;
  letter-spacing: 0.18em;
  font-size: 11px;
  text-transform: uppercase;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #11141A;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s ease;
}

.somnus-add-to-cart-btn:hover {
  background: #FFFFFF !important;
  color: #11141A !important;
}`;

  const jsonSchema = `{
  "sections": {
    "somnus_buy_box": {
      "type": "somnus-product",
      "settings": {
        "sub_title": "ST-09 CIRCADIAN RECOVERY COMPLEX",
        "show_hype_banner": ${themeConfig.showHypeBanner},
        "free_shipping_threshold": ${themeConfig.freeShippingThreshold},
        "glow_aura_intensity": "${themeConfig.glowAuraIntensity}"
      }
    }
  }
}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBlob = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCodeStr = () => {
    switch (activeTab) {
      case 'liquid': return liquidCode;
      case 'css': return cssCode;
      case 'schema': return jsonSchema;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-midnight/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" id="shopify-exporter-modal-overlay">
      <div className="bg-chalk text-midnight rounded-[2.5rem] border border-sand/40 p-6 sm:p-10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col" id="shopify-exporter-modal-card">
        
        {/* Banner Deco */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-sand via-midnight to-sand rounded-t-[2.5rem]"></div>
        
        {/* Header Block */}
        <div className="flex items-center justify-between pb-6 border-b border-midnight/10 mt-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-midnight/5 flex items-center justify-center border border-sand/40">
              <Sliders size={20} className="text-sand-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-serif font-bold tracking-tight text-midnight leading-none">SOMNUS Liquid Theme Exporter</h2>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 font-bold uppercase rounded px-1 px-1.5 font-mono">Shrine V3 Compatible</span>
              </div>
              <p className="text-xs text-midnight/60 mt-1">Plug this premium, high-converting checkout plinth template straight into any Shopify online store.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-midnight/5 flex items-center justify-center transition focus:outline-none shrink-0"
            aria-label="Close exporter"
            id="exporter-close-top-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Instruction Notice */}
        <div className="bg-sand/20 border border-sand/30 rounded-2xl p-4 my-6 flex items-start space-x-3" id="shrine-integration-lead-notice">
          <Sparkles className="text-sand shrink-0 mt-0.5" size={16} />
          <div className="text-[11px] sm:text-xs text-midnight/85 leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-midnight block mb-0.5">Shopify Shrine Theme System Integration</span>
            Our theme engine has compiled the layout into modular liquid blocks. Both benefit blocks are responsive, meaning they stack cleanly inside phone screens and reside side-by-side on PCs, resolving any overlapping display viewport issues!
          </div>
        </div>

        {/* Tab List */}
        <div className="flex border-b border-midnight/10 xs:space-x-1 sm:space-x-2 overflow-x-auto pb-px" id="exporter-tab-headers">
          <button
            onClick={() => setActiveTab('liquid')}
            className={`text-xs px-4 py-2 bg-transparent font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${activeTab === 'liquid' ? 'border-midnight text-midnight' : 'border-transparent text-midnight/55 hover:text-midnight'}`}
          >
            somnus-product.liquid
          </button>
          <button
            onClick={() => setActiveTab('css')}
            className={`text-xs px-4 py-2 bg-transparent font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${activeTab === 'css' ? 'border-midnight text-midnight' : 'border-transparent text-midnight/55 hover:text-midnight'}`}
          >
            somnus-styles.css
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`text-xs px-4 py-2 bg-transparent font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${activeTab === 'schema' ? 'border-midnight text-midnight' : 'border-transparent text-midnight/55 hover:text-midnight'}`}
          >
            section-presets.json
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`text-xs px-4 py-2 bg-transparent font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 ${activeTab === 'guide' ? 'border-midnight text-midnight' : 'border-transparent text-midnight/55 hover:text-midnight'}`}
          >
            Installation Guide
          </button>
        </div>

        {/* Tab Panels */}
        <div className="flex-1 my-6" id="exporter-panels-content">
          {activeTab !== 'guide' ? (
            <div className="relative">
              <div className="absolute top-3 right-3 flex items-center space-x-2 bg-midnight/90 rounded-lg p-1 z-10 backdrop-blur">
                <button
                  onClick={() => handleCopy(getCodeStr())}
                  className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-chalk hover:bg-white/10 transition-all flex items-center space-x-1.5"
                  aria-label="Copy to Clipboard"
                >
                  {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => downloadBlob(`shrine-${activeTab === 'liquid' ? 'somnus-product.liquid' : activeTab === 'css' ? 'somnus-styles.css' : 'somnus-presets.json'}`, getCodeStr())}
                  className="px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest text-sand hover:bg-white/10 transition-all flex items-center space-x-1.5"
                  aria-label="Download files to machine"
                >
                  <Download size={11} />
                  <span>Download</span>
                </button>
              </div>

              <textarea
                readOnly
                value={getCodeStr()}
                className="w-full h-80 bg-midnight text-chalk p-5 pt-14 rounded-3xl font-mono text-xs border border-sand/20 leading-relaxed focus:outline-none focus:ring-1 focus:ring-sand select-all"
                id="raw-code-text-display"
              />
            </div>
          ) : (
            <div className="space-y-6 text-xs text-midnight/80 leading-relaxed max-w-3xl" id="shrine-theme-step-by-step-guide">
              <div className="flex items-start space-x-3.5">
                <div className="w-6 h-6 rounded-full bg-midnight text-chalk flex items-center justify-center font-bold text-xs shrink-0 font-mono mt-0.5">1</div>
                <div>
                  <h4 className="font-extrabold text-midnight uppercase tracking-wider mb-1">Create Liquid Section inside Shopify</h4>
                  <p>In your Shopify dashboard, navigate to <strong>Online Store &gt; Themes</strong>. Click the three dots beside your theme and select <strong>Edit Code</strong>. In the file list, locate the <strong>Sections</strong> directory, click <strong>Add a new section</strong>, name it <code>somnus-product.liquid</code>, and paste the code from the first tab inside it.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-6 h-6 rounded-full bg-midnight text-chalk flex items-center justify-center font-bold text-xs shrink-0 font-mono mt-0.5">2</div>
                <div>
                  <h4 className="font-extrabold text-midnight uppercase tracking-wider mb-1">Upload Coordinated Custom Styles</h4>
                  <p>Locate the <strong>Assets</strong> directory in the Shopify code editor, click <strong>Add a new asset</strong>, create a file named <code>somnus-shrine-custom.css</code>, and paste the CSS layout styles inside it.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-6 h-6 rounded-full bg-midnight text-chalk flex items-center justify-center font-bold text-xs shrink-0 font-mono mt-0.5">3</div>
                <div>
                  <h4 className="font-extrabold text-midnight uppercase tracking-wider mb-1">Activate the theme block in Customizer</h4>
                  <p>Close the code editor, and click the blue <strong>Customize</strong> button. Inside the page selector at the top, select <strong>Products &gt; Default Product</strong>. On the sidebar list, click <strong>Add Section</strong>, search for <code>SOMNUS Shrine Buy Box</code>, and position it gracefully at the hero fold!</p>
                </div>
              </div>

              <div className="bg-sand/15 rounded-2xl p-4 border border-sand/20 flex items-center space-x-3">
                <BookOpen size={16} className="text-sand" />
                <p className="text-[11px] text-midnight/70 font-sans italic">All settings (Free Shipping, ambient aura glow) link natively to the Shopify Online Store 2.0 schema, giving you a beautiful visual editor panel similar to our live customize simulator!</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-midnight/10 mt-2">
          <div className="flex items-center space-x-2 text-[10px] text-midnight/55 tracking-wide uppercase font-semibold">
            <Cpu size={14} className="text-sand" />
            <span>Compiled package with Shrine V3 Core Engine</span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => {
                downloadBlob('somnus-product.liquid', liquidCode);
                downloadBlob('somnus-shrine-custom.css', cssCode);
                downloadBlob('somnus-presets.json', jsonSchema);
                onClose();
              }}
              className="flex-1 sm:flex-none justify-center bg-midnight text-sand border border-sand/30 hover:bg-midnight/90 px-6 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest flex items-center space-x-2 transition"
              id="download-whole-theme-pack-btn"
            >
              <Download size={14} />
              <span>Download Theme Files (.liquid + .css)</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none justify-center bg-white border border-midnight/15 text-midnight hover:bg-midnight/5 px-6 py-3 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest transition"
              id="exporter-close-bottom-btn"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
