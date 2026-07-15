import React from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterHandle?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title = "जय जगन्नाथ - लाइव दर्शन | रथ यात्रा लाइव 2026 पुरी",
  description = "भगवान जगन्नाथ का लाइव दर्शन करें। रथ यात्रा लाइव स्ट्रीम, पुरी रथ यात्रा, जगन्नाथ लाइव दर्शन।",
  keywords = "रथ यात्रा लाइव, जगन्नाथ लाइव दर्शन, पुरी रथ यात्रा, भगवान जगन्नाथ, जय जगन्नाथ",
  canonical = "https://rathyatra.rohitonelab.com",
  ogImage = "https://rathyatra.rohitonelab.com/og-image.jpg",
  ogType = "website",
  twitterHandle = "@rathyatra",
}) => {
  React.useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', ogImage);
    updateMetaTag('og:type', ogType);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:creator', twitterHandle);
    
    // Update canonical link
    updateCanonicalLink(canonical);
  }, [title, description, keywords, canonical, ogImage, ogType, twitterHandle]);
  
  return null;
};

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonicalLink(href: string) {
  let element = document.querySelector('link[rel="canonical"]');
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', href);
}

export default SEO;