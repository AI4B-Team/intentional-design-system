import { useEffect } from "react";

interface SEOHeadProps {
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
  companyName: string;
  googleAnalyticsId?: string | null;
  facebookPixelId?: string | null;
  googleTagManagerId?: string | null;
}

export function SEOHead({
  title,
  description,
  ogImageUrl,
  companyName,
  googleAnalyticsId,
  facebookPixelId,
  googleTagManagerId,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title || `${companyName} - We Buy Houses`;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || `Sell your house fast for cash to ${companyName}. No repairs, no fees, close quickly.`);

    // Update OG tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('og:title', title || `${companyName} - We Buy Houses`);
    updateOrCreateMeta('og:description', description || `Sell your house fast for cash`);
    if (ogImageUrl) {
      updateOrCreateMeta('og:image', ogImageUrl);
    }

    // Google Analytics
    if (googleAnalyticsId && !document.querySelector(`script[src*="${googleAnalyticsId}"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      document.head.appendChild(gaScript);

      const gaInit = document.createElement('script');
      gaInit.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${googleAnalyticsId}');
      `;
      document.head.appendChild(gaInit);
    }

    // Facebook Pixel
    if (facebookPixelId && !document.querySelector('script[data-fb-pixel]')) {
      const fbScript = document.createElement('script');
      fbScript.setAttribute('data-fb-pixel', 'true');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${facebookPixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Google Tag Manager
    if (googleTagManagerId && !document.querySelector(`script[src*="googletagmanager.com/gtm.js"]`)) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${googleTagManagerId}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Cleanup function
    return () => {
      // Optionally reset title on unmount
      document.title = 'REI Command Center';
    };
  }, [title, description, ogImageUrl, companyName, googleAnalyticsId, facebookPixelId, googleTagManagerId]);

  return null;
}
