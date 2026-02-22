import * as React from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-background",
        className,
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground uppercase">
          {fallback.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
