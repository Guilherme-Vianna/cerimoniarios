import Script from "next/script";
import { GOOGLE_TAG_ID } from "@/lib/analytics";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || null;

export function GoogleTag() {
  if (!GOOGLE_TAG_ID) return null;
  const extraConfig = ADS_ID && ADS_ID !== GOOGLE_TAG_ID ? `gtag('config', ${JSON.stringify(ADS_ID)});` : "";
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_TAG_ID)}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(GOOGLE_TAG_ID)});
${extraConfig}`}
      </Script>
    </>
  );
}
