"use client";

import type { Protocol } from "@/lib/protocols";
import { Button } from "@radix-ui/themes";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export const ProtocolMenu = () => {
  const params = useParams<{ protocol: Protocol }>();
  const pathname = usePathname();

  const protocolMenu = [
    {
      label: "Stats",
      href: `/protocols/${params.protocol}`,
    },
    {
      label: "Smart contracts",
      href: `/protocols/${params.protocol}/contracts`,
    },
  ];

  return (
    <div className="mt-2 flex items-center gap-5">
      {protocolMenu.map(({ label, href }) => (
        <Button
          key={href}
          size="2"
          color="gray"
          radius="full"
          variant={pathname === href ? "soft" : "ghost"}
          highContrast={pathname === href}
          asChild
        >
          <Link href={href}>{label}</Link>
        </Button>
      ))}
    </div>
  );
};
