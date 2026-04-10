/**
 * Province visual metadata
 * Shared by web and android for consistent place-based imagery.
 */

export type ProvinceVisual = {
  provinceId: number;
  majorCityEn: string;
  majorCityNp: string;
  imageUrl: string;
  imageUrlSmall: string;
  credit: string;
};

function pexelsPhoto(id: number, width: number, height: number) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
}

function buildVisual(
  provinceId: number,
  photoId: number,
  majorCityEn: string,
  majorCityNp: string,
): ProvinceVisual {
  return {
    provinceId,
    majorCityEn,
    majorCityNp,
    imageUrl: pexelsPhoto(photoId, 1280, 800),
    imageUrlSmall: pexelsPhoto(photoId, 720, 460),
    credit: `Pexels photo #${photoId}`,
  };
}

export const provinceVisuals: ProvinceVisual[] = [
  buildVisual(1, 2901209, "Biratnagar", "विराटनगर"),
  buildVisual(2, 338515, "Janakpur", "जनकपुर"),
  buildVisual(3, 2901209, "Kathmandu", "काठमाडौं"),
  buildVisual(4, 2132180, "Pokhara", "पोखरा"),
  buildVisual(5, 1457842, "Butwal", "बुटवल"),
  buildVisual(6, 3225531, "Surkhet", "सुर्खेत"),
  buildVisual(7, 417173, "Dhangadhi", "धनगढी"),
];

export const provinceVisualsById = Object.fromEntries(
  provinceVisuals.map((visual) => [visual.provinceId, visual]),
) as Record<number, ProvinceVisual>;
