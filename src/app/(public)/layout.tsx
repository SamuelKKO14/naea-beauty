import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SplashScreen } from "@/components/splash-screen";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SplashScreen />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
