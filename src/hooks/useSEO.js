import { useEffect } from 'react';

export const useSEO = ({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogTitle, 
  ogDescription, 
  ogImage, 
  ogUrl,
  twitterTitle,
  twitterDescription,
  twitterImage 
}) => {
  useEffect(() => {
    // Update title
    if (title) {
      document.title = title;
    }

    // Update meta description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = description;
    }

    // Update meta keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.name = 'keywords';
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.content = keywords;
    }

    // Update canonical URL
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Update Open Graph tags
    const updateMetaProperty = (property, content) => {
      if (content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.content = content;
      }
    };

    updateMetaProperty('og:title', ogTitle || title);
    updateMetaProperty('og:description', ogDescription || description);
    updateMetaProperty('og:image', ogImage);
    updateMetaProperty('og:url', ogUrl || canonical);

    // Update Twitter Card tags
    const updateTwitterMeta = (name, content) => {
      if (content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      }
    };

    updateTwitterMeta('twitter:title', twitterTitle || ogTitle || title);
    updateTwitterMeta('twitter:description', twitterDescription || ogDescription || description);
    updateTwitterMeta('twitter:image', twitterImage || ogImage);

    // Cleanup function (optional)
    return () => {
      // You can add cleanup logic here if needed
    };
  }, [title, description, keywords, canonical, ogTitle, ogDescription, ogImage, ogUrl, twitterTitle, twitterDescription, twitterImage]);
};
