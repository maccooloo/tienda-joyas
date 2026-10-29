import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import localFont from "next/font/local";
import Link from "next/link";
import { EB_Garamond, Inter } from "next/font/google";
import { CartProvider } from "@/src/components/cart/cart-provider";
import { CartDrawer } from "@/src/components/cart/cart-drawer";
import { SiteHeader } from "@/src/components/site/header";
import { brand } from "@/src/config/brand";
import { loadCart } from "@/src/lib/shopify/cart-actions";
import { storefrontConfig } from "@/src/lib/shopify/config";
import type { Cart } from "@/src/lib/shopify/types";
import { getHomeCollections } from "@/src/lib/shopify/storefront";
import { collectionEditorial, type NavigationCollection } from "@/src/lib/editorial";
import "./criseida.css";
import "./modern.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
});

const gfsDidot = localFont({
  src: "../public/fonts/gfs-didot-latin.woff2",
  variable: "--font-gfs-didot",
  weight: "400",
  display: "swap",
});

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: brand.name,
    template: `%s | ${brand.name}`,
  },
  description: brand.subtitle,
  applicationName: brand.name,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: brand.name,
  },
  robots: { index: true, follow: true },
};

function StorefrontShell({ children, initialCart, navigation }: { children: ReactNode; initialCart: Cart | null; navigation?: NavigationCollection[] }) {
  return (
    <CartProvider initialCart={initialCart}>
      <SiteHeader isMockShop={storefrontConfig.isMockShop} collections={navigation} />
      {children}
      <footer className="site-footer">
        <Link href="/" className="footer-brand">{brand.wordmark}</Link>
        <nav className="footer-nav" aria-label="Navegación del pie"><Link href="/#coleccion">Shop</Link><Link href="/#colecciones">Colecciones</Link><Link href="/manifiesto">La marca</Link><Link href="/#ayuda">Ayuda</Link></nav>
        <div className="footer-note"><p>{brand.tagline}</p><span>Español</span></div>
      </footer>
      <CartDrawer />
    </CartProvider>
  );
}

async function CartBootstrap({ children }: { children: ReactNode }) {
  const [initialCart, collections] = await Promise.all([loadCart().catch(() => null), getHomeCollections().catch(() => [])]);
  const navigation = collections.map((collection) => {
    const editorial = storefrontConfig.isMockShop ? collectionEditorial[collection.handle] : undefined;
    return { href: `/colecciones/${collection.handle}`, title: editorial?.title ?? collection.title, image: editorial?.image ?? collection.image?.url ?? collection.products[0]?.featuredImage?.url ?? null };
  });
  return <StorefrontShell initialCart={initialCart} navigation={navigation}>{children}</StorefrontShell>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${gfsDidot.variable} ${garamond.variable}`}>
      <body>
        <Suspense fallback={<StorefrontShell initialCart={null}>{children}</StorefrontShell>}>
          <CartBootstrap>{children}</CartBootstrap>
        </Suspense>
      </body>
    </html>
  );
}
