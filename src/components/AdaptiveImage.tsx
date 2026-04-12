import { cn } from "@/lib/utils";
import type { RoyaltyFreeImage } from "@/lib/royalty-free-images";

type AdaptiveImageProps = {
  image: RoyaltyFreeImage;
  locale: "en" | "ne";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function AdaptiveImage({
  image,
  locale,
  className,
  imgClassName,
  priority = false,
}: AdaptiveImageProps) {
  const alt = locale === "ne" ? image.altNp : image.altEn;

  return (
    <picture className={cn("block overflow-hidden", className)}>
      {image.portrait && (
        <source
          media="(max-width: 768px)"
          srcSet={image.portrait.srcSet}
          sizes={image.portrait.sizes}
        />
      )}
      <img
        src={image.landscape.src}
        srcSet={image.landscape.srcSet}
        sizes={image.landscape.sizes}
        alt={alt}
        className={cn("h-full w-full object-cover", imgClassName)}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}
