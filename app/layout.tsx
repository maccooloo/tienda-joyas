import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import localFont from "next/font/local";
import Link from "next/link";
import { Inter } from "next/font/google";
import { CartProvider } from "@/src/components/cart/cart-provider";
import { CartDrawer } from "@/src/components/cart/cart-drawer";
import { SiteHeader } from "@/src/components/site/header";
import { brand } from "@/src/config/brand";
import { loadCart } from "@/src/lib/shopify/cart-actions";
import { storefrontConfig } from "@/src/lib/shopify/config";
import type { Cart } from "@/src/lib/shopify/types";
import "./criseida.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const gfsDidot = localFont({
  src: "../public/fonts/gfs-didot-latin.woff2",
  variable: "--font-gfs-didot",
  weight: "400",
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

function StorefrontShell({ children, initialCart }: { children: ReactNode; initialCart: Cart | null }) {
  return (
    <CartProvider initialCart={initialCart}>
      <SiteHeader isMockShop={storefrontConfig.isMockShop} />
      {children}
      <footer className="site-footer">
        <Link href="/" className="footer-brand">{brand.wordmark}</Link>
        <p>{brand.tagline}</p>
        <span>Envíos y devoluciones: información provisional.</span>
      </footer>
      <CartDrawer />
    </CartProvider>
  );
}

async function CartBootstrap({ children }: { children: ReactNode }) {
  const initialCart = await loadCart().catch(() => null);
  return <StorefrontShell initialCart={initialCart}>{children}</StorefrontShell>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${gfsDidot.variable}`}>
      <body>
        <Suspense fallback={<StorefrontShell initialCart={null}>{children}</StorefrontShell>}>
          <CartBootstrap>{children}</CartBootstrap>
        </Suspense>
      </body>
    </html>
  );
}
