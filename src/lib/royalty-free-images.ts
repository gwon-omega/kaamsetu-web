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

function buildWiki(fileName: string): ResponsivePhoto {
  const enc = encodeURIComponent(fileName);
  const base = `https://commons.wikimedia.org/wiki/Special:FilePath/${enc}`;

  const widths = [640, 960, 1280, 1600];
  const srcSet = widths
    .map((width) => `${base}?width=${width} ${width}w`)
    .join(", ");

  return {
    src: `${base}?width=1280`,
    srcSet,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px",
  };
}

function buildPortraitWiki(fileName: string): ResponsivePhoto {
  const enc = encodeURIComponent(fileName);
  const base = `https://commons.wikimedia.org/wiki/Special:FilePath/${enc}`;

  const widths = [420, 620, 820, 1024];
  const srcSet = widths
    .map((width) => `${base}?width=${width} ${width}w`)
    .join(", ");

  return {
    src: `${base}?width=820`,
    srcSet,
    sizes: "(max-width: 480px) 100vw, (max-width: 768px) 92vw, 680px",
  };
}

export const royaltyFreeImages: Record<RoyaltyFreeImageKey, RoyaltyFreeImage> =
  {
    hero: {
      altEn: "Bhaktapur Durbar Square - Heritage site in Nepal",
      altNp: "भक्तपुर दरबार स्क्वायर - ऐतिहासिक सम्पदा",
      credit: "Wikimedia Commons",
      landscape: buildWiki("Bhaktapur_Durbar_Square_2018_13.jpg"),
      portrait: buildPortraitWiki("Bhaktapur_Durbar_Square_2018_13.jpg"),
    },
    communityWork: {
      altEn: "Sunrise view from Poon Hill, Ghorepani",
      altNp: "पुनहिल, घोरेपानीबाट सूर्योदयको दृश्य",
      credit: "Wikimedia Commons",
      landscape: buildWiki("Sunrise_from_Poon_Hill,_Ghorepani.jpg"),
      portrait: buildPortraitWiki("Sunrise_from_Poon_Hill,_Ghorepani.jpg"),
    },
    himalayanContext: {
      altEn: "Rhino in Chitwan National Park",
      altNp: "चितवन राष्ट्रिय निकुञ्जमा गैंडा",
      credit: "Wikimedia Commons",
      landscape: buildWiki("Rhino-Chitwan_National_Park.jpg"),
      portrait: buildPortraitWiki("Rhino-Chitwan_National_Park.jpg"),
    },
  };
