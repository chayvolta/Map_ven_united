// Lot Images Manifest
// Maps lot CLAVE_GNPI (normalized - with Ø replaced by _) to folder and image list for each desarrollo
// Supports JPG, PNG, and WebP formats

// Desarrollo folder mapping - maps desarrollo name from GeoJSON to public folder name
export const DESARROLLO_FOLDER_MAP = {
  Huatulco: 'Huatulco',
  Ixtapa: 'Ixtapa',
  'Ixtapa-Zihuatanejo': 'Ixtapa',
  Loreto: 'Loreto',
  'Loreto - Nopoló': 'Nopolo',
  'Loreto - Nopolo': 'Nopolo',
  Nopoló: 'Nopolo',
  Nopolo: 'Nopolo',
};

const CDN_BASE_URL =
  'https://cdn-fonatur-bddmcafqc9csawfh.a01.azurefd.net/portafolio/Travel_LA/public';

const DESARROLLO_ALIASES = {
  'ixtapa-zihuatanejo': 'Ixtapa',
  'loreto - nopolo': 'Nopolo',
};

function resolveDesarrolloFolder(desarrollo) {
  if (!desarrollo) return null;

  const directMatch = DESARROLLO_FOLDER_MAP[desarrollo];
  if (directMatch) return directMatch;

  const normalizedDesarrollo = desarrollo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  return DESARROLLO_ALIASES[normalizedDesarrollo] || null;
}

// Image manifest for all lots - clave (normalized) -> array of image filenames
// Includes photos only (files starting with "1."), excluding KMZ and PL (plan) images
// Supports multiple formats: jpg, jpeg, png, webp
export const LOT_IMAGES_MANIFEST = {
    "05_03_C_1_4-1__": [
        "1.jpeg",
        "2.jpeg",
        "4.jpeg"
    ],
    "05_05_MCH_1_1A__": [
        "01-ARPOFCD04300T.JPG",
        "01.JPG",
        "02.JPG",
        "03.JPG"
    ],
    "05_05_MCH_2_1__": [
        "1.1. Lote 1, Manzana 2, Mirador Chahué.JPG",
        "1.2. Lote 1, Manzana 2, Mirador Chahué.JPG",
        "1.3. Lote 1, Manzana 2, Mirador Chahué.jpg",
        "1.4. Lote 1, Manzana 2, Mirador Chahué.jpg",
        "1.5. Lote 1, Manzana 2, Mirador Chahué.jpg"
    ],
    "05_05_MCH_4_1__": [
        "1.1. Lote 1, Manzana 4, Mirador Chahué.JPG",
        "1.2. Lote 1, Manzana 4, Mirador Chahué.jpg"
    ],
    "05_05_MCH_4_2__": [
        "1.1. Lote 2, Manzana 4, Mirador Chahué.JPG",
        "1.2. Lote 2, Manzana 4, Mirador Chahué.JPG",
        "1.3. Lote 2, Manzana 4, Mirador Chahué.JPG"
    ],
    "05_05_MCH_5_2__": [
        "1.1. Lote 2, Manzana 5, Mirador Chahué.JPG",
        "1.2. Lote 2, Manzana 5, Mirador Chahué.JPG",
        "1.3. Lote 2, Manzana 5, Mirador Chahué.jpg"
    ],
    "05_05_MCH_5_3__": [
        "LOTE 3 MANZANA 5 SECTOR MIRADOR CHAHUE (1).jpg",
        "LOTE 3 MANZANA 5 SECTOR MIRADOR CHAHUE (2).jpg",
        "LOTE 3 MANZANA 5 SECTOR MIRADOR CHAHUE (3).jpg",
        "LOTE 3 MANZANA 5 SECTOR MIRADOR CHAHUE (4).jpg"
    ],
    "05_05_MCH_6_1__": [
        "1.1. Lote 1, Manzana 6, Mirador Chahué.JPG",
        "1.2. Lote 1, Manzana 6, Mirador Chahué.jpg"
    ],
    "05_05_MCH_6_2__": [
        "1.1. Lote 2, Manzana 6, Mirador Chahué.JPG",
        "1.2. Lote 2, Manzana 6, Mirador Chahué.JPG",
        "1.3. Lote 2, Manzana 6, Mirador Chahué.jpg"
    ],
    "05_05_MCH_6_5__": [
        "1.1. Lote 5, Manzana 6, Mirador Chahué.png",
        "1.2. Lote 5, Manzana 6, Mirador Chahué.png",
        "1.3. Lote 5, Manzana 6, Mirador Chahué.JPG",
        "1.4. Lote 5, Manzana 6, Mirador Chahué.png",
        "1.5. Lote 5, Manzana 6, Mirador Chahué.jpg",
        "1.6. Lote 5, Manzana 6, Mirador Chahué.jpg",
        "1.7. Lote 5, Manzana 6, Mirador Chahué.png"
    ],
    "05_05_MCH_8_2__": [
        "1.1. Lote 2, Manzana 8, Mirador Chahué.png",
        "1.2. Lote 2, Manzana 8, Mirador Chahué.JPG",
        "1.3. Lote 2, Manzana 8, Mirador Chahué.png",
        "1.4. Lote 2, Manzana 8, Mirador Chahué.png",
        "1.5. Lote 2, Manzana 8, Mirador Chahué.png"
    ],
    "05_06_ARRO_5_1__": [
        "1.1. Lt 1, Mz 5, Arrocito.JPG.png",
        "1.2. Lt 1, Mz 5, Arrocito.JPG.png",
        "1.3. Lt 1, Mz 5, Arrocito.JPG.png",
        "1.4. Lt 1, Mz 5, Arrocito.JPG",
        "1.5. Lt 1, Mz 5, Arrocito.JPG",
        "1.6. Lt 1, Mz 5, Arrocito.JPG",
        "1.7. Lt 1, Mz 5, Arrocito.JPG"
    ],
    "02_03_4_2_27__": [
        "1.1IMG20230516103753.jpg",
        "1.2IMG20230516103933.jpg"
    ],
    "02_03_4_2_28__": [
        "1.1IMG20230516103908.jpg",
        "1.2IMG20230516103922.jpg"
    ],
    "02_11_CONT_4A_17__": [
        "1.1_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.2_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.3_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.4_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.5_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.6_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.7_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.8_LT17_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.9_LT17_MZ4A_CONTRAMAR_FOTO.jpg"
    ],
    "02_11_CONT_4A_18__": [
        "1.1_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.2_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.3_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.4_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.5_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.6_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.7_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.8_LT18_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.9_LT18_MZ4A_CONTRAMAR_FOTO.jpg"
    ],
    "02_11_CONT_4A_23__": [
        "1.10_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.11_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.1_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.2_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.3_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.4_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.5_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.6_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.7_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.8_LT23_MZ4A_CONTRAMAR_FOTO.jpg",
        "1.9_LT23_MZ4A_CONTRAMAR_FOTO.jpg"
    ],
    "04_01_P-II_10A_1__": [
        "1.1_Mz 10A ZV PARQUE - Lt 1-1.jpg",
        "1.2_Mz 10A ZV PARQUE - Lt 1-2.jpg"
    ],
    "04_01_P-II_10_1__": [
        "1.1_Mz 10 - Lt 1-5.jpg",
        "1.2_Mz 10 - Lt 1-6.jpg"
    ],
    "04_01_P-II_11_1__": [
        "1._Mz 11 - Lt 1-6.jpg"
    ],
    "04_01_P-II_11_2__": [
        "1._Mz 11 - Lt 2.jpg"
    ],
    "04_01_P-II_12_1__": [
        "1._Mz 12 - Lt 1-2.jpg"
    ],
    "04_01_P-II_13_1__": [
        "1._Mz 13 - Lt 1.jpg"
    ],
    "04_01_P-II_13_2__": [
        "1._Mz 13 - Lt 2.jpg"
    ],
    "04_01_P-II_14_1__": [
        "1.1_Mz 14 - Lt 1-3.jpg",
        "1.2_Mz 14 - Lt 1-4.jpg",
        "1.3_Mz 14 - Lt 1-5.jpg"
    ],
    "04_01_P-II_14_2__": [
        "1.1_Mz 14 - Lt 2-2.jpg",
        "1.2_Mz 14 - Lt 2-3.jpg",
        "1.3_Mz 14 - Lt 2-4.jpg"
    ],
    "04_01_P-II_15_1__": [
        "1._Mz 15 - Lt 1-2.jpg"
    ],
    "04_01_P-II_16_1__": [
        "1._Mz 16 - Lt 1-1.jpg"
    ],
    "04_01_P-II_16_2__": [
        "1._Mz 16 - Lt 2-2.jpg"
    ],
    "04_01_P-II_17_1__": [
        "1._Mz 17 - Lt 1-1.jpg"
    ],
    "04_01_P-II_17_2__": [
        "1._Mz 17 - Lt 2.jpg"
    ],
    "04_01_P-II_18_1__": [
        "1._Mz 18 - Lt 1-2.jpg"
    ],
    "04_01_P-II_19_1__": [
        "1._Mz 19 - Lt 1.jpg"
    ],
    "04_01_P-II_1_1__": [
        "1.2_Mz 1 - Lt 1-4.jpg",
        "1._Mz 1 - Lt 1-3.jpg"
    ],
    "04_01_P-II_1_2__": [
        "1._Mz 1 - Lt 2-2.jpg"
    ],
    "04_01_P-II_1_3__": [
        "1.1_Mz 1 - Lt 3-1.jpg",
        "1.2_Mz 1 - Lt 3-2.jpg",
        "3._LT 001 MZ 108 ZN 002 PL.JPG"
    ],
    "04_01_P-II_20_1__": [
        "1._Mz 20 - Lt 1-1.jpg"
    ],
    "04_01_P-II_2_1__": [
        "1.1_Mz 2 - Lt 1-1.jpg",
        "1.2_Mz 2 - Lt 1-2.jpg"
    ],
    "04_01_P-II_3_1__": [
        "1._Mz 3 - Lt 1-3.jpg"
    ],
    "04_01_P-II_4_1__": [
        "1.1_Mz 4 - Lt 1-2.jpg",
        "1.2_Mz 4 - Lt 1-3.jpg"
    ],
    "04_01_P-II_4_2__": [
        "1._Mz 4 - Lt 2-2.jpg"
    ],
    "04_01_P-II_4_3__": [
        "1._Mz 4 - Lt 3.jpg"
    ],
    "04_01_P-II_5_1__": [
        "1._Mz 5 - Lt 1-1.jpg"
    ],
    "04_01_P-II_5_2__": [
        "1._Mz 5 - Lt 2.jpg"
    ],
    "04_01_P-II_6_1__": [
        "1._Mz 6 - Lt 1-1.jpg"
    ],
    "04_01_P-II_7_1__": [
        "1._Mz 7 - Lt 1-1.jpg"
    ],
    "04_01_P-II_8_1__": [
        "1.1_Mz 8 - Lt 1-2.jpg",
        "1.2_Mz 8 - Lt 1-3.jpg"
    ],
    "04_01_P-II_9_1__": [
        "1.1_Mz 9 - Lt 1-6.jpg",
        "1.2_Mz 9 - Lt 1-7.jpg"
    ],
    "04_01_P-II__RAMBLA__": [
        "1.jpg",
        "2.jpg",
        "3.jpg"
    ],
    "06_02_10_10_10__": [
        "1.1IMG_0397.JPG",
        "1.2IMG_0398.JPG",
        "1.3IMG_0399.JPG",
        "1.4IMG_0400.JPG",
        "1.5IMG_0401.JPG",
        "1.6IMG_0402.JPG",
        "1.7IMG_0403.JPG"
    ],
    "06_02_10_10_11__": [
        "1.1IMG_0405.JPG",
        "1.2IMG_0406.JPG"
    ],
    "06_02_10_10_12__": [
        "1.1IMG_0411.JPG",
        "1.2IMG_0412.JPG"
    ],
    "06_02_10_10_13__": [
        "1.1IMG_0416.JPG",
        "1.2IMG_0417.JPG",
        "1.3IMG_0418.JPG",
        "1.4IMG_0419.JPG",
        "1.5IMG_0420.JPG",
        "1.6IMG_0421.JPG",
        "1.7IMG_0422.JPG"
    ],
    "06_02_10_10_14__": [
        "1.10IMG_0436.JPG",
        "1.11IMG_0437.JPG",
        "1.12IMG_0438.JPG",
        "1.1IMG_0424.JPG",
        "1.2IMG_0426.JPG",
        "1.3IMG_0427.JPG",
        "1.4IMG_0428.JPG",
        "1.5IMG_0429.JPG",
        "1.6IMG_0430.JPG",
        "1.7IMG_0432.JPG",
        "1.8IMG_0433.JPG",
        "1.9IMG_0434.JPG"
    ],
    "06_02_10_10_15__": [
        "1.1IMG_0445.JPG",
        "1.2IMG_0446.JPG",
        "1.3IMG_0447.JPG",
        "1.4IMG_0448.JPG",
        "1.5IMG_0449.JPG",
        "1.6IMG_0450.JPG",
        "1.7IMG_0451.JPG",
        "1.8IMG_0452.JPG"
    ],
    "06_02_10_10_16__": [
        "1.1IMG_0461.JPG",
        "1.2IMG_0463.JPG",
        "1.3IMG_0466.JPG",
        "1.4IMG_0467.JPG",
        "1.5IMG_0468.JPG",
        "1.6IMG_0469.JPG",
        "1.7IMG_0470.JPG",
        "1.8IMG_0472.JPG"
    ],
    "06_02_10_10_17__": [
        "1.10IMG_0484.JPG",
        "1.1IMG_0475.JPG",
        "1.2IMG_0476.JPG",
        "1.3IMG_0477.JPG",
        "1.4IMG_0478.JPG",
        "1.5IMG_0479.JPG",
        "1.6IMG_0480.JPG",
        "1.7IMG_0481.JPG",
        "1.8IMG_0482.JPG",
        "1.9IMG_0483.JPG"
    ],
    "06_02_10_10_20__": [
        "1.1IMG_0486.JPG",
        "1.2IMG_0487.JPG",
        "1.3IMG_0489.JPG",
        "1.4IMG_0490.JPG",
        "1.5IMG_0491.JPG",
        "1.6IMG_0492.JPG",
        "1.7IMG_0499.JPG"
    ],
    "06_02_10_10_21__": [
        "1.2LT 21 MZ 10 CAMPO_GOLF-NOP.jpg",
        "1.3LT 21_2 MZ 10 CAMPO_GOLF-NOP.jpg",
        "1.4LT 21_3 MZ 10 CAMPO_GOLF-NOP.jpg",
        "1.5LT 21_4 MZ 10 CAMPO_GOLF-NOP.jpg",
        "1.6LT 21_5 MZ 10 CAMPO_GOLF-NOP.jpg"
    ],
    "06_02_10_10_47__": [
        "1.1LT 47 MZ 10 CAMPO_GOLF-NOP.jpg",
        "1.2LT 47_2 MZ 10 CAMPO_GOLF-NOP.jpg",
        "1.3LT 47_3 MZ 10 CAMPO_GOLF-NOP.jpg"
    ],
    "06_02_10_10_48__": [
        "1.1IMG_0502.JPG",
        "1.2IMG_0503.JPG",
        "1.3IMG_0504.JPG",
        "1.4IMG_0505.JPG",
        "1.5IMG_0506.JPG",
        "1.6IMG_0512.JPG"
    ]
};

/**
 * Get the images for a specific lot
 * @param {Object} lot - The lot object with properties
 * @returns {string[]} Array of image URLs for the lot
 */
export function getLotImages(lot) {
  if (!lot?.properties) return [];

  const desarrollo = lot.properties.desarrollo || lot.properties.Desarrollo;
  const clave = lot.properties.clave || lot.properties.CLAVE_GNPI;

  if (!desarrollo || !clave) return [];

  // Normalize the clave (replace Ø with _)
  const normalizedClave = clave.replace(/Ø/g, '_');

  // Get the folder name for the desarrollo
  const folderName = resolveDesarrolloFolder(desarrollo);
  if (!folderName) return [];

  // Get the images for the lot from manifest
  const imageFiles = LOT_IMAGES_MANIFEST[normalizedClave];
  if (!imageFiles || imageFiles.length === 0) return [];

  // Build full URLs for each image
  // All image formats (jpg, jpeg, png, webp) are supported by the browser's img tag
  return imageFiles.map(fileName => {
    // Use encodeURI for the full path - it's less aggressive than encodeURIComponent
    // and better handles accented characters that Vite serves correctly
    const path = `${CDN_BASE_URL}/${folderName}/${normalizedClave}/${fileName}`;
    return encodeURI(path);
  });
}
