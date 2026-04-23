import React from "react";

interface PokemonSpriteProps {
  speciesName: string;
  type: string;
  spriteUrl: string;
  className?: string;
  isBack?: boolean;
}

export function PokemonSprite({ speciesName, type, spriteUrl, className = "", isBack = false }: PokemonSpriteProps) {
  if (!spriteUrl.includes("/api/sprites/") && spriteUrl.trim() !== "") {
    return <img src={spriteUrl} alt={speciesName} className={`object-contain ${className}`} />;
  }

  const normalizedType = type.toLowerCase();
  
  const exactPokemonMap: Record<string, number> = {
    "abomasnow": 460,
    "abra": 63,
    "absol": 359,
    "alakazam": 65,
    "altaria": 334,
    "arcanine": 59,
    "articuno": 144,
    "baltoy": 343,
    "baxcalibur": 998,
    "bayleef": 153,
    "blastoise": 9,
    "braixen": 654,
    "camerupt": 323,
    "capsakid": 951,
    "chandelure": 609,
    "charizard": 6,
    "charmander": 4,
    "charmeleon": 5,
    "chikorita": 152,
    "chinchou": 170,
    "claydol": 344,
    "delibird": 225,
    "delphox": 653,
    "dracozolt": 880,
    "dragapult": 887,
    "dragonair": 148,
    "dragonite": 149,
    "dratini": 147,
    "drifblim": 426,
    "drifloon": 425,
    "eelektross": 604,
    "emolga": 587,
    "fletchinder": 662,
    "frigibax": 996,
    "giratina": 487,
    "glalie": 362,
    "gligar": 207,
    "gliscor": 472,
    "golett": 622,
    "golurk": 623,
    "growlithe": 58,
    "jynx": 124,
    "kadabra": 64,
    "krookodile": 553,
    "lanturn": 171,
    "lotad": 270,
    "ludicolo": 272,
    "luxio": 404,
    "luxray": 405,
    "magnemite": 81,
    "magnezone": 462,
    "meganium": 154,
    "misdreavus": 200,
    "mismagius": 429,
    "mr. mime": 122,
    "phantump": 708,
    "pichu": 172,
    "pikachu": 25,
    "raichu": 26,
    "reshiram": 643,
    "rotom": 479,
    "sandile": 551,
    "sandslash": 28,
    "sandshrew": 27,
    "scovillain": 952,
    "snorunt": 361,
    "snover": 459,
    "spheal": 363,
    "squirtle": 7,
    "swablu": 333,
    "talonflame": 663,
    "torterra": 389,
    "trevenant": 709,
    "turtonator": 776,
    "walrein": 365,
    "wartortle": 8,
    "zapdos": 145,
    "zekrom": 644,
  };

  let pokemonId = exactPokemonMap[speciesName.toLowerCase()];

  if (!pokemonId) {
    // Expanded arrays of Pokemon IDs based on their elemental typing 
    // Source: PokeAPI standard national dex IDs
    const typePokemonMap: Record<string, number[]> = {
      fire: [4, 5, 6, 37, 38, 58, 59, 77, 78, 126, 136, 146, 155, 156, 157],
      water: [7, 8, 9, 54, 55, 60, 61, 62, 72, 73, 79, 80, 86, 87, 90, 91, 98, 99, 116, 118, 120, 129, 130, 131, 134, 158, 159, 160],
      ground: [27, 28, 50, 51, 74, 75, 76, 95, 104, 105, 111, 112, 246, 247, 248],
      flying: [16, 17, 18, 21, 22, 41, 42, 83, 84, 85, 144, 163, 164, 276, 277],
      electric: [25, 26, 81, 82, 100, 101, 125, 135, 145, 172, 179, 180, 181],
      ghost: [92, 93, 94, 200, 302, 353, 354, 425, 426, 442, 477, 478, 487],
      ice: [124, 131, 144, 215, 220, 221, 225, 361, 362, 363, 378, 471],
      grass: [1, 2, 3, 43, 44, 45, 46, 47, 69, 70, 71, 114, 152, 153, 154, 182, 187, 188, 189, 191, 192],
      psychic: [63, 64, 65, 96, 97, 122, 150, 151, 177, 178, 196, 202, 280, 281, 282, 480, 481, 482],
      dragon: [147, 148, 149, 230, 334, 371, 372, 373, 380, 381, 384, 443, 444, 445, 483, 484, 487],
      bug: [10, 11, 12, 13, 14, 15, 46, 47, 48, 49, 123, 127, 165, 166, 167, 168, 212, 213, 214],
      poison: [23, 24, 29, 30, 31, 32, 33, 34, 41, 42, 88, 89, 109, 110],
      rock: [74, 75, 76, 95, 111, 112, 138, 139, 140, 141, 142],
      steel: [81, 82, 208, 212, 227, 304, 305, 306, 374, 375, 376, 483],
      dark: [197, 198, 215, 228, 229, 248, 302, 359, 442, 491],
      fairy: [35, 36, 39, 40, 173, 174, 175, 176, 183, 184, 209, 210, 280, 281, 282]
    };

    const pokemonList = typePokemonMap[normalizedType] || [133]; // Default to Eevee

    // Create a deterministic index based on the speciesName string
    const seed = speciesName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    pokemonId = pokemonList[seed % pokemonList.length];
  }

  const imgUrl = isBack 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return (
    <img 
      src={imgUrl} 
      alt={speciesName} 
      className={`object-contain w-full h-full ${className}`} 
      style={undefined}
    />
  );
}
