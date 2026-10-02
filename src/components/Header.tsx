import { Link, useRouterState } from "@tanstack/react-router";
import {
  Navbar01,
  type Navbar01NavLink,
} from "@/components/ui/shadcn-io/navbar-01";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

const NAV_LINKS: Navbar01NavLink[] = [
  { href: "/overview", label: "Tổng quan" },
  { href: "/branch", label: "Chi nhánh" },
  { href: "/risk", label: "Rủi ro" },
  { href: "/product", label: "Sản phẩm" },
  { href: "/customer", label: "Khách hàng" },
  { href: "/contract", label: "Hợp đồng" },
];

// Custom logo component for TanStack
const TanStackLogo = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/tanstack-word-logo-white.svg"
    alt="TanStack Logo"
    className="h-8"
  />
);

// Wrapper to use TanStack Router Link
const RouterLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof Link>
>(({ to, children, ...props }, ref) => {
  return (
    <Link to={to} ref={ref} {...props}>
      {children}
    </Link>
  );
});
RouterLink.displayName = "RouterLink";

export default function Header() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Mark the active navigation link based on current path
  const navigationLinks = NAV_LINKS.map((link) => ({
    ...link,
    active: currentPath === link.href,
  }));

  return (
    <Navbar01
      logo={<TanStackLogo />}
      logoHref="/"
      navigationLinks={navigationLinks}
      signInText="Đăng nhập"
      ctaText="Bắt đầu"
    />
  );
}
