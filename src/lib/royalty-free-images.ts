type ResponsivePhoto = {
  src: string;
  srcSet: string;
  sizes: string;
};

export type RoyaltyFreeImage = {
  altEn: string;
  altNp: string;
  credit: string;
  landscape: ResponsivePhoto;
  portrait?: ResponsivePhoto;
};

type RoyaltyFreeImageKey = "hero" | "communityWork" | "himalayanContext";

function pexelsPhoto(id: number, width: number, height: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
}

function buildLandscape(id: number): ResponsivePhoto {
  const widths = [640, 960, 1280, 1600];
  const srcSet = widths
    .map(
      (width) =>
        `${pexelsPhoto(id, width, Math.round(width * 0.62))} ${width}w`,
    )
    .join(", ");

  return {
    src: pexelsPhoto(id, 1280, 794),
    srcSet,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px",
  };
}

function buildPortrait(id: number): ResponsivePhoto {
  const widths = [420, 620, 820, 1024];
  const srcSet = widths
    .map(
      (width) => `${pexelsPhoto(id, width, Math.round(width * 1.3))} ${width}w`,
    )
    .join(", ");

  return {
    src: pexelsPhoto(id, 820, 1066),
    srcSet,
    sizes: "(max-width: 480px) 100vw, (max-width: 768px) 92vw, 680px",
  };
}

export const royaltyFreeImages: Record<RoyaltyFreeImageKey, RoyaltyFreeImage> =
  {
    hero: {
      altEn: "Skilled local worker at a construction site in Nepal",
      altNp: "नेपालमा स्थानीय निर्माण स्थलमा दक्ष कामदार",
      credit: "Pexels royalty-free stock photo #1457842",
      landscape: buildLandscape(1457842),
      portrait: buildPortrait(1457842),
    },
    communityWork: {
      altEn: "Skilled worker at a local construction site",
      altNp: "स्थानीय निर्माण स्थलमा दक्ष कामदार",
      credit: "Pexels royalty-free stock photo #1457842",
      landscape: buildLandscape(1457842),
      portrait: buildPortrait(1457842),
    },
    himalayanContext: {
      altEn: "Himalayan settlement context for local livelihoods",
      altNp: "स्थानीय जीविकोपार्जनका लागि हिमाली बस्तीको सन्दर्भ",
      credit: "Pexels royalty-free stock photo #2132180",
      landscape: buildLandscape(2132180),
      portrait: buildPortrait(2132180),
    },
  };
