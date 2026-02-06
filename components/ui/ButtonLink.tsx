import Link, { LinkProps } from "next/link";
import {
  buttonClassName,
  ButtonSize,
  ButtonVariant,
} from "@/components/ui/buttonStyles";

type ButtonLinkProps = LinkProps & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
};

export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
