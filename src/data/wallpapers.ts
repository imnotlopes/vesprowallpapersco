// Catálogo de obras. Cada obra vira /wallpaper/[slug] e entra no sitemap de imagens.
// Prévias públicas sempre com marca d'água (scripts/gerar-previas.py); originais ficam fora do repositório.
// Regra editorial: marcas e logos podem aparecer; rosto de famoso e personagem nunca aparecem no site.
export type Device = 'desktop' | 'iphone' | 'ultrawide' | 'ipad';

export interface Wallpaper {
  source?: string;       // número do original antigo (oil wallpaper/desktop), só para gerar a prévia
  file?: string;         // nome do arquivo na pasta da coleção em arts/ (artes novas), só para gerar a prévia
  collection: string | null;   // chave do produto em api/_lib/products.js; null = só no VESPRO™ Editions
  hd?: boolean;          // arquivo em HD (1672 × 941) em vez de 4K
  slug: string;
  title: string;         // nome buscável em inglês
  theme: ThemeKey;
  colors: string[];
  devices: Device[];
  description: string;   // texto original da página da obra
}

export type ThemeKey = 'animals' | 'cars' | 'ocean' | 'winter' | 'cities' | 'money' | 'countryside' | 'still-life'
  | 'sports' | 'noir' | 'motivational' | 'classic' | 'luxury';

export interface Theme {
  key: ThemeKey;
  name: string;          // usado em "<name> wallpapers"
  title: string;
  description: string;
  intro: string;
}

export const THEMES: Record<ThemeKey, Theme> = {
  animals: {
    key: 'animals', name: 'Animal',
    title: 'Animal Wallpapers 4K: Oil Painting Art | VESPRO™',
    description: 'Oil painting animal wallpapers in 4K: lions, tigers, horses, cats and dogs in thick impasto brushstrokes.',
    intro: 'Lions, horses, big cats and one very relaxed dog, painted with heavy brushstrokes so the fur and manes have real texture on your screen.',
  },
  cars: {
    key: 'cars', name: 'Car',
    title: 'Car Wallpapers 4K: Oil Painting Sports & Classic Cars | VESPRO™',
    description: 'Oil painting car wallpapers in 4K: sports cars, classic cars and Havana streets, painted in impasto.',
    intro: 'Sports cars, classic interiors and old Havana streets, painted thick enough that the chrome and paintwork catch the light.',
  },
  ocean: {
    key: 'ocean', name: 'Ocean',
    title: 'Ocean Wallpapers 4K: Oil Painting Sea & Waves | VESPRO™',
    description: 'Oil painting ocean wallpapers in 4K: giant waves, tall ships, yachts and deep blue water in impasto.',
    intro: 'Giant waves, tall ships and deep blue water. The sea is where impasto shines: every crest is a ridge of paint.',
  },
  winter: {
    key: 'winter', name: 'Winter',
    title: 'Winter Wallpapers 4K: Snow & Mountain Oil Paintings | VESPRO™',
    description: 'Oil painting winter wallpapers in 4K: snowy mountains, skiers, snowboarders and snow angels in impasto.',
    intro: 'Snowy peaks, skiers and fresh powder, painted in whites and blues that stay calm behind your icons.',
  },
  cities: {
    key: 'cities', name: 'City',
    title: 'City Wallpapers 4K: Oil Painting Streets & Skylines | VESPRO™',
    description: 'Oil painting city wallpapers in 4K: New York skyline, rainy European streets, baroque churches and night scenes.',
    intro: 'Rainy boulevards, lamp-lit alleys and a New York skyline at night. Cities painted with the warmth of an old canvas.',
  },
  money: {
    key: 'money', name: 'Money',
    title: 'Money Wallpapers 4K: Oil Painting Cash & Dollar Art | VESPRO™',
    description: 'Money wallpapers in 4K painted in oil: dollar bills, stacks of cash and cats who mean business.',
    intro: 'Dollar bills, stacks of cash and a couple of cats who clearly run the business.',
  },
  countryside: {
    key: 'countryside', name: 'Countryside',
    title: 'Countryside Wallpapers 4K: Oil Painting Landscapes | VESPRO™',
    description: 'Oil painting countryside wallpapers in 4K: lake houses, golden fields and village squares.',
    intro: 'Lake houses, golden fields and village squares, painted in warm evening light.',
  },
  'still-life': {
    key: 'still-life', name: 'Still Life',
    title: 'Still Life Wallpapers 4K: Moody Oil Paintings | VESPRO™',
    description: 'Moody oil painting wallpapers in 4K: chess, cards, quiet interiors and classical frescoes.',
    intro: 'Chess pieces, a single card, quiet rooms at night. Darker, minimal paintings that keep your desktop calm.',
  },
  sports: {
    key: 'sports', name: 'Sports',
    title: 'Sports Wallpapers: Tennis, Golf & Polo Oil Paintings | VESPRO™',
    description: 'Oil painting sports wallpapers: tennis courts on the Riviera, golf by the sea, polo, sailing, boxing and aviation in thick impasto.',
    intro: 'Clay courts on the lake, golf swings over the sea, polo at full gallop. Sport painted with the slow luxury of an oil canvas.',
  },
  noir: {
    key: 'noir', name: 'Black and White',
    title: 'Black and White Wallpapers 4K: Noir Oil Paintings | VESPRO™',
    description: 'Black and white oil painting wallpapers in 4K: noir versions of our impasto paintings for a dark, minimal desktop.',
    intro: 'Every brushstroke in black, white and grey. Noir versions of our favourite paintings, made for dark mode and minimal setups.',
  },
  motivational: {
    key: 'motivational', name: 'Motivational',
    title: 'Motivational Wallpapers 4K: Oil Painting Quotes | VESPRO™',
    description: 'Motivational wallpapers in 4K painted in oil: quotes, stairways to the sky and reminders to aim higher.',
    intro: 'Quotes and quiet reminders, painted thick: stairways into the clouds, an airship over the city and words worth reading every morning.',
  },
  classic: {
    key: 'classic', name: 'Classic Art',
    title: 'Classic Art Wallpapers 4K: Statues, Samurai & Old Masters | VESPRO™',
    description: 'Classic art wallpapers in 4K: marble statues, samurai, Japanese castles, court jesters and dramatic oil painting scenes.',
    intro: 'Marble statues, samurai duels and a jester by candlelight. Old-world drama painted in heavy, textured strokes.',
  },
  luxury: {
    key: 'luxury', name: 'Luxury',
    title: 'Luxury Wallpapers 4K: Oil Painting Lifestyle Art | VESPRO™',
    description: 'Luxury wallpapers in 4K painted in oil: gold cufflinks, supercars in the office, champagne and quiet power.',
    intro: 'Gold cufflinks, supercars parked in the office and a drink while the world burns behind you. Quiet power, painted in oil.',
  },
};

/** Temas com obras suficientes para uma página indexável. */
export const MIN_THEME = 5;

// Primeiras 37 obras (originais em oil wallpaper/desktop). A coleção vem do tema (ver WALLPAPERS abaixo).
const FIRST: Omit<Wallpaper, 'collection'>[] = [
  { source: '010', slug: 'lion-cub-red-sports-car', title: 'Lion Cub on a Red Sports Car', theme: 'cars', colors: ['red', 'black'], devices: ['desktop'],
    description: 'A lion cub peeks over the bonnet of a glossy red sports car, lit like a studio portrait. Deep reds and blacks make it a striking, dark desktop.' },
  { source: '011', slug: 'white-lion-black-car', title: 'White Lion in a Black Car', theme: 'cars', colors: ['black', 'white'], devices: ['desktop'],
    description: 'A white lion leans out of a black luxury car on a busy city street. Bold contrast and heavy texture on the mane and paintwork.' },
  { source: '012', slug: 'tiger-panther-swimming', title: 'Tiger and Panther Swimming', theme: 'animals', colors: ['blue', 'orange'], devices: ['desktop'],
    description: 'Seen from above, a tiger and a black panther glide through turquoise water. The ripples are built from thick strokes of blue and white.' },
  { source: '013', slug: 'black-cat-money', title: 'Black Cat on a Pile of Money', theme: 'money', colors: ['black', 'brown', 'green'], devices: ['desktop'],
    description: 'A black cat lounges on a pile of dollar bills with one in its mouth, against a warm rust-colored wall.' },
  { source: '014', slug: 'jockey-racehorse', title: 'Jockey at Full Gallop', theme: 'animals', colors: ['white', 'black'], devices: ['desktop'],
    description: 'A jockey and a dark racehorse at full stretch against a pale, textured sky. Mostly light tones, so desktop icons stay easy to read.' },
  { source: '015', slug: 'chess-reflection-water', title: 'Chess Pieces Reflected in Water', theme: 'still-life', colors: ['gray', 'black'], devices: ['desktop'],
    description: 'Chess pieces stand on a flooded board, their reflections broken by ripples. A quiet, grey-green painting for a minimal setup.' },
  { source: '016', slug: 'black-sports-car-horse-ranch', title: 'Black Sports Car at the Horse Ranch', theme: 'cars', colors: ['green', 'black', 'gold'], devices: ['desktop'],
    description: 'A black sports car parked beside a grazing horse on a sunlit ranch, with golden grass and a white fence.' },
  { source: '019', slug: 'lion-cub-classic-car', title: 'Lion Cub in a Classic Car', theme: 'cars', colors: ['red', 'cream'], devices: ['desktop'],
    description: 'A lion cub sits on the cream leather seat of a classic car with a red interior and palm trees outside the window.' },
  { source: '020', slug: 'dog-in-the-clouds', title: 'Dog in the Clouds', theme: 'animals', colors: ['blue', 'white'], devices: ['desktop'],
    description: 'A dog stretches out on a bright sky full of puffy clouds. Light blues and whites with plenty of open space for your icons.' },
  { source: '021', slug: 'cat-stacks-of-cash', title: 'Cat at the Table with Stacks of Cash', theme: 'money', colors: ['green', 'brown'], devices: ['desktop'],
    description: 'A grey cat sits at a round table next to a tower of green cash stacks, in a warm, old-world room.' },
  { source: '028', slug: 'white-horse-rider-dusk', title: 'Rider on a White Horse at Dusk', theme: 'animals', colors: ['brown', 'white', 'orange'], devices: ['desktop'],
    description: 'A rider urges a white horse forward through a dusty arena at sunset, the motion blurred into long strokes of paint.' },
  { source: '030', slug: 'shark-school-of-fish', title: 'Shark in a School of Fish', theme: 'ocean', colors: ['blue', 'teal'], devices: ['desktop'],
    description: 'A lone shark cuts through a swirling school of fish, seen from above. Deep teal and navy, ideal for a dark desktop.' },
  { source: '031', slug: 'masked-figure-snowy-mountains', title: 'Figure in a Balaclava in the Snowy Mountains', theme: 'winter', colors: ['white', 'black', 'orange'], devices: ['desktop'],
    description: 'A figure in a black balaclava leans on a railing above snowy pine forests, with an orange sunset behind the peaks.' },
  { source: '032', slug: 'rustic-kitchen-dusk', title: 'Rustic Kitchen at Dusk', theme: 'still-life', colors: ['brown', 'black'], devices: ['desktop'],
    description: 'A figure stands in a dark, rustic kitchen lit by a single window. Low-key browns and blacks for a moody screen.' },
  { source: '033', slug: 'couple-under-street-lamp', title: 'Couple Under a Street Lamp', theme: 'cities', colors: ['orange', 'brown', 'black'], devices: ['desktop'],
    description: 'A couple meets under a glowing street lamp in an old stone passage at night, in warm amber and deep shadow.' },
  { source: '034', slug: 'children-village-square', title: 'Children Playing Ball in a Village Square', theme: 'countryside', colors: ['cream', 'blue'], devices: ['desktop'],
    description: 'Children chase a ball across a sunlit village square in front of weathered walls and blue shutters.' },
  { source: '035', slug: 'couple-walking-in-the-rain', title: 'Couple Walking in the Rain', theme: 'cities', colors: ['gray', 'gold'], devices: ['desktop'],
    description: 'A couple walks arm in arm along a rain-soaked park path, the wet ground reflecting the glow of the lamps.' },
  { source: '036', slug: 'renaissance-philosophers-fresco', title: 'Renaissance Philosophers Fresco', theme: 'still-life', colors: ['cream', 'blue', 'red'], devices: ['desktop'],
    description: 'An impasto take on a classical Renaissance fresco of philosophers gathered under grand arches.' },
  { source: '038', slug: 'tall-ship-open-sea', title: 'Tall Ship on the Open Sea', theme: 'ocean', colors: ['blue', 'cream'], devices: ['desktop'],
    description: 'A tall ship under full sail crosses a choppy sea beneath a bright, cloud-filled sky.' },
  { source: '039', slug: 'baroque-church-european-street', title: 'Baroque Church on a European Street', theme: 'cities', colors: ['gold', 'blue'], devices: ['desktop'],
    description: 'A twin-towered baroque church glows in late sun above a busy cobbled street full of people and carriages.' },
  { source: '041', slug: 'crowd-colonnade-palace', title: 'Crowd at the Colonnade Palace', theme: 'cities', colors: ['cream', 'red'], devices: ['desktop'],
    description: 'A festive crowd fills the square in front of a grand palace with columns and red banners.' },
  { source: '043', slug: 'galloping-horses', title: 'Galloping Horses Close-Up', theme: 'animals', colors: ['brown', 'white'], devices: ['desktop'],
    description: 'Two horses, one white and one chestnut, gallop side by side in a tight, dramatic close-up full of motion.' },
  { source: '044', slug: 'superyacht-sunset', title: 'Superyacht at Sunset', theme: 'ocean', colors: ['gold', 'blue'], devices: ['desktop'],
    description: 'A superyacht cruises through rolling waves under a golden sunset sky.' },
  { source: '046', slug: 'havana-classic-cars', title: 'Havana Street with Classic Cars', theme: 'cars', colors: ['pink', 'blue', 'cream'], devices: ['desktop'],
    description: 'A pink classic car rolls down a colourful Havana street lined with pastel buildings and leafy trees.' },
  { source: '047', slug: 'lake-house-golden-hour', title: 'Lake House Deck at Golden Hour', theme: 'countryside', colors: ['gold', 'green'], devices: ['desktop'],
    description: 'A wooden deck with armchairs looks over a still lake toward a red-brick house and hills at golden hour.' },
  { source: '048', slug: 'snow-angel', title: 'Snow Angel', theme: 'winter', colors: ['white', 'blue'], devices: ['desktop'],
    description: 'A figure in ski gear makes a snow angel in deep, fresh powder, seen from directly above.' },
  { source: '050', slug: 'skiers-snowy-mountain', title: 'Skiers on a Snowy Mountain', theme: 'winter', colors: ['white', 'blue'], devices: ['desktop'],
    description: 'Tiny skiers carve down a vast snowy slope beneath jagged alpine peaks and a bright blue sky.' },
  { source: '051', slug: 'late-night-home-office', title: 'Late-Night Home Office', theme: 'still-life', colors: ['brown', 'gold'], devices: ['desktop'],
    description: 'Someone works late on a laptop at a marble desk in a dark, wood-panelled room lit by brass lamps.' },
  { source: '052', slug: 'hundred-dollar-bill', title: 'Crumpled Hundred-Dollar Bill', theme: 'money', colors: ['cream', 'green'], devices: ['desktop'],
    description: 'A crumpled hundred-dollar bill fills the frame, every fold built up in pale, textured paint.' },
  { source: '053', slug: 'ace-of-spades', title: 'Ace of Spades', theme: 'still-life', colors: ['black', 'white'], devices: ['desktop'],
    description: 'A single ace of spades on a black, heavily textured background. Minimal and very dark.' },
  { source: '055', slug: 'family-field-sunset', title: 'Family in a Field at Sunset', theme: 'countryside', colors: ['green', 'gold'], devices: ['desktop'],
    description: 'A family plays in a long-grass meadow at the edge of a dark forest, lit by low evening sun.' },
  { source: '058', slug: 'surfer-giant-wave', title: 'Surfer and the Giant Wave', theme: 'ocean', colors: ['blue', 'white'], devices: ['desktop'],
    description: 'A tiny surfer faces a towering wave about to break, its curl sculpted from thick blue and white paint.' },
  { source: '059', slug: 'helicopter-rescue-sea', title: 'Helicopter Rescue at Sea', theme: 'ocean', colors: ['gray', 'white'], devices: ['desktop'],
    description: 'A helicopter hovers over a stormy grey sea as a rescuer is lowered toward the waves.' },
  { source: '060', slug: 'shaka-rainbow-sea', title: 'Shaka Sign Under a Rainbow', theme: 'ocean', colors: ['blue', 'green'], devices: ['desktop'],
    description: 'A hand throws a shaka from deep blue water, with a rainbow over a green mountain coastline.' },
  { source: '061', slug: 'snowboarder-powder', title: 'Snowboarder in Deep Powder', theme: 'winter', colors: ['white', 'gray'], devices: ['desktop'],
    description: 'A snowboarder sits back in deep powder, sending up a wave of snow, painted almost entirely in whites and greys.' },
  { source: '062', slug: 'skier-snowy-slope', title: 'Skier on a Snowy Slope', theme: 'winter', colors: ['white', 'blue', 'red'], devices: ['desktop'],
    description: 'A skier in red descends a pine-lined valley under snow-covered peaks.' },
  { source: '063', slug: 'new-york-skyline-toast', title: 'Toast Above the New York Skyline', theme: 'cities', colors: ['gold', 'blue', 'black'], devices: ['desktop'],
    description: 'A couple raises a toast in front of tall windows overlooking the New York skyline at night.' },
];

// ---- Coleções novas (originais em arts/, fora do repositório) ----
// Marcas, logos e carros podem aparecer. Pessoas famosas e personagens vão apenas dentro do download
// do VESPRO™ Editions e entram só na contagem (HIDDEN), nunca no site.
type Extra = Partial<Pick<Wallpaper, 'hd'>>;
const D = ['desktop'] as Device[];
const SIG = (file: string, slug: string, title: string, theme: ThemeKey, colors: string[], description: string, x: Extra = {}): Wallpaper =>
  ({ file, slug, title, theme, colors, devices: D, description, collection: 'signature', ...x });
const SPO = (file: string, slug: string, title: string, theme: ThemeKey, colors: string[], description: string): Wallpaper =>
  ({ file, slug, title, theme, colors, devices: D, description, collection: 'sporting', hd: true });

const SIGNATURE: Wallpaper[] = [
  SIG('bobo-da-corte-vermelho', 'jester-in-red-candlelight', 'Jester in Red by Candlelight', 'classic', ['red', 'blue', 'gold'],
    'A court jester in red slumps in a carved chair while a gothic cathedral glows outside the window, painted in swirling, restless strokes.'),
  SIG('campo-golfe-aereo', 'golf-course-from-above', 'Golf Course from Above', 'sports', ['green', 'blue'],
    'An aerial view of rolling fairways, blue water hazards and sand bunkers, dotted with tiny golfers and white carts.'),
  SIG('carro-classico-branco', 'white-classic-car-red-wall', 'White Classic Car by the Red Wall', 'cars', ['red', 'white', 'blue'],
    'A white vintage sedan glides past a bold red wall with an arched window to the sea, mirrored in still water. Surreal and calm.'),
  SIG('casa-moderna-cipreste', 'modern-house-under-cypress', 'Modern House Under a Cypress', 'countryside', ['blue', 'green', 'orange'],
    'A minimalist white house glows at dusk on a green clifftop, sheltered by a wind-bent cypress above the sea.'),
  SIG('casal-danca-tango', 'tango-in-the-dark', 'Tango in the Dark', 'classic', ['black', 'gold'],
    'A couple locked in a slow tango, carved out of darkness with heavy strokes and warm golden light.'),
  SIG('cavaleiro-cavalo-fogo', 'rider-on-a-horse-of-fire', 'Rider on a Horse of Fire', 'animals', ['orange', 'blue'],
    'A cloaked rider gallops across a golden field on a horse made of flames, under a deep blue sky.'),
  SIG('cavalo-branco-empinado', 'white-horse-rearing-at-night', 'White Horse Rearing at Night', 'animals', ['white', 'blue', 'black'],
    'A ghostly white horse and its veiled rider rear up between dark towers under a stormy night sky.'),
  SIG('cuba-musicos', 'havana-street-musicians', 'Havana Street Musicians', 'cities', ['blue', 'white', 'green'],
    'Three musicians play guitar in the shade of a tree on a sunlit Havana street, a Cuban flag at their side.'),
  SIG('david-estatua-costas', 'marble-statue-from-behind', 'Marble Statue from Behind', 'classic', ['black', 'white'],
    'The muscular back of a classical marble statue, sculpted out of darkness with heavy white strokes.'),
  SIG('deserto-oasis', 'desert-oasis-arches', 'Desert Oasis with Arches', 'countryside', ['red', 'orange', 'blue'],
    'Two palm trees and a white arched wall hide inside a canyon of glowing red rock.'),
  SIG('dirigivel-cidade', 'the-world-is-yours-airship', 'The World Is Yours Airship', 'motivational', ['blue', 'black'],
    'An airship flashing "The world is yours" drifts over a glittering city skyline at night.'),
  SIG('dobermans-fogo', 'dobermans-before-the-fire', 'Dobermans Before the Fire', 'animals', ['black', 'orange', 'green'],
    'Two dobermans in gold chains sit perfectly still in front of a burning hedge.'),
  SIG('drink-explosao', 'a-drink-by-the-explosion', 'A Drink by the Explosion', 'luxury', ['blue', 'orange', 'green'],
    'A man in a white shirt calmly sips champagne by the lake while an explosion blooms behind him.'),
  SIG('escada-nuvens', 'stairway-into-the-sunset', 'Stairway into the Sunset', 'motivational', ['blue', 'orange'],
    'A man in a suit climbs an endless staircase that rises into a blue and gold sunset sky.'),
  SIG('esquiador', 'skier-in-mid-air', 'Skier in Mid-Air', 'winter', ['black', 'white'],
    'A freeskier launches off a cornice above a frozen wave of snow, painted in black, white and grey.'),
  SIG('frase-money-talks', 'money-talks', 'Money Talks', 'money', ['blue', 'beige'],
    'A torn navy canvas reveals the face on a hundred-dollar bill above the words "Money talks".'),
  SIG('futebol-gol-estadio', 'goal-in-the-golden-stadium', 'Goal in the Golden Stadium', 'sports', ['gold', 'green', 'blue'],
    'A goalkeeper lies beaten as the ball hits the net in a stadium lit gold by the evening sun.'),
  SIG('gato-dolares', 'black-cat-guarding-dollars', 'Black Cat Guarding Dollars', 'money', ['black', 'gold'],
    'A black cat with amber eyes clutches a pile of hundred-dollar bills and dares you to take one.'),
  SIG('golfe-montanhas', 'golf-by-the-alpine-lake', 'Golf by the Alpine Lake', 'sports', ['green', 'blue'],
    'Two golfers walk a bright green fairway beside a turquoise lake ringed by mountains.'),
  SIG('hidroaviao-oceano', 'red-seaplane-over-the-ocean', 'Red Seaplane over the Ocean', 'ocean', ['blue', 'red', 'white'],
    'A red biplane skims a glittering blue ocean under rows of white summer clouds.'),
  SIG('homem-casa-em-chamas', 'man-watching-the-house-burn', 'Man Watching the House Burn', 'classic', ['orange', 'red', 'green'],
    'A man stands perfectly still on the path as a country house goes up in flames in front of him.'),
  SIG('homem-escritorio-mclaren', 'silver-supercar-in-the-office', 'Silver Supercar in the Office', 'luxury', ['grey', 'blue'],
    'A man in a grey suit leans back at his desk beside a silver supercar parked among the books.'),
  SIG('iates-mar-azul', 'yachts-on-deep-blue-water', 'Yachts on Deep Blue Water', 'ocean', ['blue', 'white'],
    'White yachts and a sailboat carve trails across a deep blue sea, seen from above.'),
  SIG('janela-mar-vermelho', 'red-window-to-the-sea', 'Red Window to the Sea', 'ocean', ['red', 'blue', 'white'],
    'An arched opening in a glowing red wall frames a calm blue sea and summer clouds.'),
  SIG('lua-castelo-japones', 'japanese-castle-full-moon', 'Japanese Castle Under a Full Moon', 'classic', ['gold', 'black'],
    'A Japanese castle stands out against a huge golden full moon on a dark night.'),
  SIG('macaco-executivo', 'the-chimp-executive', 'The Chimp Executive', 'luxury', ['blue', 'grey'],
    'A chimpanzee in a tweed jacket takes a call in front of a falling sales chart. Every office has one.'),
  SIG('mansao-supercarros', 'supercars-at-the-palm-mansion', 'Supercars at the Palm Mansion', 'cars', ['red', 'white', 'blue'],
    'Three classic supercars line up in front of a white mansion under tall palm trees.'),
  SIG('mao-anel-ouro', 'the-gold-cufflink', 'The Gold Cufflink', 'luxury', ['black', 'gold', 'white'],
    'Close-up of hands adjusting a gold cufflink on a crisp white cuff, painted in rich dark tones.'),
  SIG('mergulho-lago', 'diving-from-a-classic-boat', 'Diving from a Classic Boat', 'ocean', ['blue', 'brown'],
    'A man dives from the bow of a classic wooden speedboat into a deep blue mountain lake.'),
  SIG('monge-campo', 'wanderer-in-the-tea-fields', 'Wanderer in the Tea Fields', 'classic', ['green', 'black'],
    'A figure in a straw hat and black robe walks through rolling green tea fields.'),
  SIG('nadador-oceano', 'swimmer-in-the-open-ocean', 'Swimmer in the Open Ocean', 'ocean', ['blue', 'pink'],
    'A lone swimmer crosses a vast blue ocean that fades to pink at the horizon.'),
  SIG('no-risk-no-story-focus', 'no-risk-no-story', 'No Risk, No Story', 'motivational', ['white', 'blue', 'red'],
    'A boy balances a spoon on his nose among painted notes that read "No risk, no story", "Focus" and "I wanna travel the world".'),
  SIG('pantera-fonte', 'panther-by-the-fountain', 'Panther by the Fountain', 'animals', ['red', 'black', 'beige'],
    'A black panther rests beside a stone fountain in a red Mediterranean courtyard.'),
  SIG('pantera-negra-dinheiro', 'black-leopard-on-cash', 'Black Leopard on a Pile of Cash', 'money', ['black', 'gold'],
    'A black leopard with golden eyes lies across a pile of dollar bills.'),
  SIG('pantera-quadro-sofa', 'leopard-and-the-panther-portrait', 'Leopard and the Panther Portrait', 'animals', ['red', 'black', 'gold'],
    'A leopard prowls past a red-framed portrait of a black panther in a dark, elegant room.'),
  SIG('polo-azul', 'polo-players-on-deep-blue', 'Polo Players on Deep Blue', 'sports', ['blue', 'gold'],
    'Three polo players at full gallop, floating on a field of deep blue brushstrokes.'),
  SIG('porsche-santorini', 'red-sports-car-in-santorini', 'Red Sports Car in Santorini', 'cars', ['red', 'white', 'blue'],
    'A red sports car parks between the white walls and blue domes of Santorini, above the sea.'),
  SIG('portofino', 'portofino-harbour', 'Portofino Harbour', 'cities', ['green', 'blue', 'orange'],
    'Colourful houses wrap around the yacht-filled harbour of Portofino, seen from the green hills.'),
  SIG('quadra-tenis-ceu', 'tennis-court-by-the-sea', 'Tennis Court by the Sea', 'sports', ['green', 'blue'],
    'A green tennis court on a clifftop, open to the sea under a big summer sky.'),
  SIG('quadra-tenis-tropical', 'pink-tennis-court-in-the-jungle', 'Pink Tennis Court in the Jungle', 'sports', ['pink', 'green'],
    'A pink tennis court hidden among palms, flowers and tropical mountains.'),
  SIG('samurais-caverna-gelo', 'duel-in-the-ice-cave', 'Duel in the Ice Cave', 'classic', ['grey', 'white', 'black'],
    'Two samurai face each other in the shallow water of a frozen cave.'),
  SIG('surf-helicoptero', 'surfer-and-the-helicopter', 'Surfer and the Helicopter', 'ocean', ['blue', 'white'],
    'A helicopter hovers low over a surfer riding a turquoise wave.'),
  SIG('surf', 'lone-surfer-on-a-blue-wave', 'Lone Surfer on a Blue Wave', 'ocean', ['blue', 'white'],
    'A tiny surfer rides beneath a long curling wave on a deep blue sea.'),
  SIG('surfista-onda', 'surfer-carving-the-wave', 'Surfer Carving the Wave', 'ocean', ['green', 'blue', 'white'],
    'A surfer carves hard across a green wave, throwing a fan of white spray into the air.'),
  SIG('tenis-iate', 'tennis-court-and-yacht-at-night', 'Tennis Court and Yacht at Night', 'sports', ['blue', 'green'],
    'A hidden tennis court among palm trees looks out to a lit yacht on a moonlit sea.'),
  SIG('tenis-saibro', 'clay-court-on-the-lake', 'Clay Court on the Lake', 'sports', ['orange', 'green', 'blue'],
    'Two players rally on an orange clay court above a lake ringed by mountains and villas.'),
  SIG('tenis-villa', 'villa-tennis-court-riviera', 'Villa Tennis Court on the Riviera', 'sports', ['green', 'blue', 'yellow'],
    'A green tennis court beside a yellow villa, cypress trees and a lake on the Riviera.'),
  SIG('tenista-quadra-laranja', 'tennis-player-orange-court', 'Tennis Player on an Orange Court', 'sports', ['orange', 'red'],
    'Seen from above, a tennis player and a long shadow on a court of blazing orange strokes.'),
  SIG('tigre-agua', 'tiger-crossing-the-stream', 'Tiger Crossing the Stream', 'animals', ['teal', 'orange'],
    'A tiger steps along a fallen log into a clear turquoise stream.'),
  SIG('tigre-branco-colina', 'white-tiger-on-a-green-hill', 'White Tiger on a Green Hill', 'animals', ['green', 'blue', 'white'],
    'A white tiger rests on rolling green hills under towering white clouds.'),
  SIG('tigre-nadando', 'tiger-swimming-turquoise-water', 'Tiger Swimming in Turquoise Water', 'animals', ['teal', 'orange'],
    'A tiger swims straight toward you through sparkling turquoise water.'),
  SIG('xadrez-piscina', 'chess-in-the-pool', 'Chess in the Pool', 'still-life', ['blue', 'white'],
    'Two old friends play chess on the edge of a bright blue swimming pool.'),
  SIG('Tutto Passa', 'tutto-passa', 'Tutto Passa', 'motivational', ['blue', 'orange'],
    'An old man in sunglasses lights a cigarette beneath the words "Tutto passa" on a Mediterranean harbour.', { hd: true }),
  // marcas, logos e carros (liberados para o site; pessoas famosas e personagens continuam só no Editions)
  SIG("911-branco", "white-911-in-the-fog", "White 911 in the Fog", "cars", ["white", "grey"],
    "A white classic 911 sits alone in a pale, foggy studio of thick cream paint. Minimal and calm behind your icons."),
  SIG("carro-suspenso-sala", "supercar-hanging-in-the-lounge", "Supercar Hanging in the Lounge", "luxury", ["black", "gold"],
    "A black Lamborghini hangs on chains above a chesterfield lounge while a woman waits on the sofa. Dark, glossy and dramatic."),
  SIG("escritorio-ferrari-f40", "red-f40-in-the-office", "Red F40 in the Office", "luxury", ["red", "gold"],
    "A businessman sits at a cluttered 80s desk with a red Ferrari F40 parked beside him and the city behind the glass."),
  SIG("ferrari-branca-quadra", "white-ferrari-on-the-court", "White Ferrari on the Court", "cars", ["white", "green"],
    "A white Ferrari Enzo parked on a wet basketball court surrounded by forest."),
  SIG("gato-porsche", "cat-on-the-gt3-rs", "Cat on the GT3 RS", "cars", ["white", "gold"],
    "A ginger cat sits on the rear wing of a white Porsche GT3 RS among palms at night."),
  SIG("monge-cha", "monk-pouring-tea-on-a-gt3-rs", "Monk Pouring Tea on a GT3 RS", "luxury", ["orange", "blue"],
    "A monk in saffron robes pours tea on the rear wing of an orange Porsche GT3 RS under a night sky."),
  SIG("porsche-palmeiras", "black-911-under-the-palms", "Black 911 Under the Palms", "cars", ["black", "white"],
    "A black 911 Turbo with the door open, parked by a white wall and palm trees."),
  SIG("cavalo-ferrari", "white-horse-and-red-ferrari", "White Horse and Red Ferrari", "cars", ["red", "white"],
    "A white horse stands over a red Ferrari in a smoky crimson studio. The prancing horse, painted for real."),
  SIG("esquiadores-neve", "monogram-ski-slope", "Monogram Ski Slope", "winter", ["white"],
    "Tiny skiers and snowboarders carve a slope embossed with the Louis Vuitton monogram, between dark pines."),
  SIG("f1-ferrari-pit-stop", "red-pit-stop", "Red Pit Stop", "sports", ["red", "yellow"],
    "A Ferrari crew leans over the pit wall as a red car flies down the pit lane past bold yellow lettering."),
  SIG("ferrari-cavalo-preto", "black-horse-black-ferrari", "Black Horse, Black Ferrari", "cars", ["black", "white"],
    "A black horse stands behind a black Ferrari on a pale, heavily textured background."),
  SIG("ferrari-need-money-bugatti", "need-money-for-bugatti", "Need Money for Bugatti", "motivational", ["black", "gold"],
    "A black Ferrari on a night street, its side sprayed with \"Need money for Bugatti\"."),
  SIG("ferraris-f1", "three-red-f1-cars", "Three Red F1 Cars", "sports", ["red", "white"],
    "Three classic red Formula 1 cars lined up on a clean white canvas. Minimal and bold."),
  SIG("gato-maybach", "cat-on-the-maybach", "Cat on the Maybach", "luxury", ["black", "gold"],
    "A tabby cat stretches across the hood of a black Maybach on a lamplit night street."),
  SIG("lamborghini-pantera", "wild-cat-on-the-lamborghini", "Wild Cat on the Lamborghini", "cars", ["grey", "orange"],
    "A spotted wild cat prowls over the hood of a grey Lamborghini at sunset."),
  SIG("leopardo-porsche", "leopard-on-the-red-porsche", "Leopard on the Red Porsche", "cars", ["red", "gold"],
    "A leopard climbs over the rear wing of a red Porsche between golden palms."),
  SIG("louis-vuitton-azul-piscina", "monogram-pool-in-blue", "Monogram Pool in Blue", "luxury", ["blue"],
    "Swimmers and floats drift across a blue pool painted with the Louis Vuitton monogram."),
  SIG("louis-vuitton-rosa", "monogram-in-pink", "Monogram in Pink", "luxury", ["pink"],
    "Tiny skaters and palm trees on a pink surface embossed with the Louis Vuitton monogram."),
  SIG("louis-vuitton-verde", "monogram-golf-course", "Monogram Golf Course", "luxury", ["green", "teal"],
    "Golfers, carts and palms dot a mint green course shaped by the Louis Vuitton monogram."),
  SIG("monaco-gp-ferrari", "monaco-grand-prix", "Monaco Grand Prix", "sports", ["red", "blue"],
    "A red F1 car sweeps through the palm-lined streets of Monaco past grandstands and hotels."),
  SIG("polo-nuvens", "polo-pony-in-the-clouds", "Polo Pony in the Clouds", "luxury", ["blue", "white"],
    "Clouds form the famous polo player emblem against a bright blue sky."),
  SIG("porsche-golfe", "green-911-with-a-golf-bag", "Green 911 with a Golf Bag", "cars", ["green", "yellow"],
    "A green vintage Porsche 911 with a golf bag on the roof, parked on a sunny fairway."),
  SIG("senna-monaco-2", "classic-f1-at-monaco", "Classic F1 Car at Monaco", "sports", ["red", "white", "gold"],
    "A red and white early 90s F1 car rounds the corner below the golden terraces of Monaco."),
  SIG("supreme-logo", "supreme-box-logo", "Supreme Box Logo", "luxury", ["red", "white"],
    "The red box logo painted huge and close, its letters running off the edge of the canvas."),
  SIG("supreme-vermelho-japones", "supreme-in-japanese", "Supreme in Japanese", "luxury", ["red", "white"],
    "A red box logo rendered in bold Japanese style characters, thick white paint on red."),
];

const SPORTING: Wallpaper[] = [
  SPO('002-golfe', 'golf-club-at-sunset', 'Golf Club at Sunset', 'sports', ['gold', 'green'],
    'A hand pulls a driver from the bag on a golf cart as the sun sets over the course.'),
  SPO('004-veleiro', 'tall-ship-through-the-rope', 'Tall Ship Through the Rope', 'ocean', ['blue', 'brown'],
    'A schooner under full sail, framed by a coil of thick ship rope.'),
  SPO('005-golfe', 'office-golf-new-york', 'Office Golf with a New York View', 'sports', ['red', 'green', 'gold'],
    'A man practises his putt on the carpet of a wood-panelled office high above New York.'),
  SPO('006-mergulho', 'speedboat-dive-mountain-lake', 'Speedboat Dive on the Mountain Lake', 'ocean', ['blue', 'brown'],
    'A swimmer leaps from a classic wooden speedboat into choppy blue water below green mountains.'),
  SPO('007-esqui', 'skier-in-deep-powder', 'Skier in Deep Powder', 'winter', ['white', 'grey'],
    'A skier disappears into an explosion of deep powder snow.'),
  SPO('008-alpinista', 'climber-on-a-snowy-ridge', 'Climber on a Snowy Ridge', 'winter', ['white', 'blue', 'red'],
    'A climber walks a knife-edge ridge of snow above a sea of clouds.'),
  SPO('009-snowboard', 'snowboarder-black-and-white', 'Snowboarder in Black and White', 'winter', ['black', 'white'],
    'A snowboarder leans into a huge spray of snow, painted only in black and white.'),
  SPO('010-escalada', 'climbing-the-alpine-summit', 'Climbing the Alpine Summit', 'winter', ['white', 'blue', 'orange'],
    'A climber pulls up onto a rocky summit with snowy Alps stretching to the horizon.'),
  SPO('011-piloto', 'fighter-pilot-salute', 'Fighter Pilot Salute at Sunset', 'sports', ['orange', 'green', 'blue'],
    'A fighter pilot salutes from the cockpit as the sun sets behind him.'),
  SPO('012-punhos', 'wrapped-boxing-fists', 'Wrapped Boxing Fists', 'sports', ['brown', 'white'],
    'Two fists wrapped in white boxing tape, ready for the first round.'),
  SPO('013-snowboard', 'snowboard-run-first-person', 'Snowboard Run in First Person', 'winter', ['white', 'blue', 'green'],
    'Your own snowboard points down a sunny piste lined with snowy pines.'),
  SPO('014-veleiro', 'on-deck-in-the-open-sea', 'On Deck in the Open Sea', 'ocean', ['blue', 'white'],
    'A sailor stands at the bow of a sailboat cutting through deep blue waves.'),
  SPO('015-veleiro', 'classic-sailboat-crew', 'Classic Sailboat Crew', 'ocean', ['blue', 'white', 'brown'],
    'A crew leans out of a classic wooden sailboat heeling hard in rough water.'),
  SPO('016-circuito', 'street-race-in-paris', 'Street Race in Paris', 'sports', ['gold', 'orange', 'blue'],
    'Race cars tear down a Paris boulevard toward the Eiffel Tower at sunset.'),
  SPO('017-golfe', 'golf-swing-on-the-pier', 'Golf Swing on the Pier', 'sports', ['blue', 'green'],
    'A golfer drives a ball from a wooden pier out over a turquoise bay.'),
  SPO('018-polo', 'polo-players-and-the-black-suv', 'Polo Players and the Black SUV', 'sports', ['green', 'black'],
    'Two polo players rest their horses beside a black SUV on a green field.'),
  SPO('019-piloto', 'pilot-in-front-of-the-jet', 'Pilot in Front of the Jet', 'sports', ['grey', 'orange'],
    'A fighter pilot in full gear stands in front of a jet at dusk.'),
  SPO('020-prancha', 'surfboard-on-black-sand', 'Surfboard on Black Sand', 'ocean', ['black', 'white', 'teal'],
    'Seen from above, a white surfboard lies on black sand where the waves break.'),
  SPO('021-alpinista', 'roped-climber-in-the-gorge', 'Roped Climber in the Gorge', 'winter', ['white', 'grey'],
    'A roped climber pushes up a snowy gorge between dark granite walls.'),
  SPO('022-aviao', 'light-plane-at-sunset', 'Light Plane at Sunset', 'sports', ['orange', 'white', 'blue'],
    'A pilot climbs onto the wing of a small white plane under a fiery sunset.'),
  SPO('025-snowboarder', 'snowboarder-carving-powder', 'Snowboarder Carving Powder', 'winter', ['white', 'blue', 'black'],
    'A snowboarder in black carves through a wave of blue and white powder.'),
  SPO('028-arqueiro', 'mounted-archer', 'Mounted Archer', 'sports', ['green', 'brown', 'blue'],
    'An archer draws his bow while galloping across a green field.'),
  // pilotos de capacete, Porsche, Rolex e Everlast (marcas liberadas para o site)
  SPO("001-piloto-f1-vermelho-comemorando", "f1-driver-celebrating", "F1 Driver Celebrating in Red", "sports", ["red", "black"],
    "A driver in a red race suit and helmet throws both arms up in celebration."),
  SPO("003-f1-classicos-tres-carros-pista", "three-classic-f1-cars", "Three Classic F1 Cars", "sports", ["red", "white", "yellow"],
    "Three legendary early 90s F1 cars battle on a dark, tyre-marked track."),
  SPO("023-esportivo-picadeiro-cavalos", "sports-car-in-the-riding-arena", "Sports Car in the Riding Arena", "cars", ["brown", "gold"],
    "A brown Porsche GT3 RS parked in an indoor arena while riders circle on horseback."),
  SPO("024-cavalo-saltando-sobre-esportivo", "horse-jumping-over-a-sports-car", "Horse Jumping over a Sports Car", "cars", ["black", "brown"],
    "A show jumper clears the rear wing of a black Porsche in a sunlit arena."),
  SPO("026-polo-galope-mansao", "polo-at-the-mansion", "Polo at the Mansion", "sports", ["green", "gold"],
    "A polo player gallops past a Rolex banner in front of a grand country house."),
  SPO("027-cavalo-feno-e-esportivo-verde", "horse-eating-hay-from-a-911", "Horse Eating Hay from a 911", "cars", ["green", "brown"],
    "A horse eats hay piled in the open front trunk of a dark green 911."),
  SPO("029-boxeador-ginasio-pb", "boxer-in-the-gym", "Boxer in the Gym", "sports", ["black", "white"],
    "A boxer trains alone in a dark gym, painted in black and white."),
  SPO("030-piloto-capacete-amarelo-entrando-no-carro", "driver-in-the-yellow-helmet", "Driver in the Yellow Helmet", "sports", ["red", "yellow"],
    "A driver in a yellow helmet climbs into a red F1 car as the crew gathers around."),
];

// Shadows: versões noir de obras da Signature (mesma arte em preto e branco)
const NOIR_OF = ['cavalo-ferrari', 'cuba-musicos', 'deserto-oasis', 'dirigivel-cidade', 'dobermans-fogo', 'drink-explosao', 'escada-nuvens',
  'esquiador', 'ferrari-cavalo-preto', 'ferraris-f1', 'frase-money-talks', 'gato-dolares', 'gato-porsche', 'golfe-montanhas',
  'hidroaviao-oceano', 'lamborghini-pantera', 'leopardo-porsche', 'mansao-supercarros', 'mergulho-lago', 'monaco-gp-ferrari',
  'monge-campo', 'monge-cha', 'pantera-fonte', 'polo-azul', 'polo-nuvens', 'porsche-golfe', 'porsche-palmeiras', 'porsche-santorini',
  'portofino', 'senna-monaco-2', 'surf-helicoptero', 'surf', 'surfista-onda', 'tenis-iate', 'tenis-saibro', 'tenis-villa',
  'tigre-agua', 'xadrez-piscina'];
const SHADOWS: Wallpaper[] = NOIR_OF.map((f) => {
  const p = SIGNATURE.find((w) => w.file === f)!;
  return { file: `${f}-noir`, slug: `${p.slug}-noir`, title: `${p.title} Noir`, theme: 'noir', colors: ['black', 'white', 'grey'], devices: D,
    description: `${p.description.split('. ')[0].replace(/\.$/, '')}. Reworked in black and white for a dark, minimal desktop.`, collection: 'shadows' };
});

/** Coleções vendidas a partir das 37 primeiras obras: uma por tema. */
const FIRST_PACKS = ['ocean', 'cities', 'winter', 'animals', 'cars', 'still-life'];

export const WALLPAPERS: Wallpaper[] = [
  ...FIRST.map((w) => ({ ...w, collection: FIRST_PACKS.includes(w.theme) ? w.theme : null })),
  ...SIGNATURE, ...SPORTING, ...SHADOWS,
];

/** Obras que vão só dentro do download do VESPRO™ Editions e nunca aparecem no site
 *  (pessoas famosas, personagens e as que o dono preferiu não mostrar). Marcas e logos podem aparecer. */
export const HIDDEN: Record<string, number> = { signature: 26, sporting: 0, shadows: 12 };
export const HIDDEN_TOTAL = Object.values(HIDDEN).reduce((a, b) => a + b, 0);
/** Total de obras no VESPRO™ Editions (as do site + as que só vêm no download). */
export const EDITIONS_COUNT = WALLPAPERS.length + HIDDEN_TOTAL;
/** Como o site fala do tamanho do VESPRO™ Editions: sem número exato, porque cresce a cada edição. */
export const EDITIONS_LABEL = '150+';
if (EDITIONS_COUNT < 150) throw new Error(`EDITIONS_LABEL diz 150+, mas o Editions tem ${EDITIONS_COUNT} obras`);
/** Quantidade de obras como o site mostra: nada de número quebrado. Abaixo de 10 fica exato; múltiplo de 5 fica como está;
 *  o resto arredonda para baixo, de 5 em 5, com "+" (38 vira "35+", 78 vira "75+"). */
export const countLabel = (n: number) => (n < 10 || n % 5 === 0 ? String(n) : `${Math.floor(n / 5) * 5}+`);

export const preview = (w: Wallpaper, size: 800 | 400 = 800) => (size === 800 ? `/img/w/${w.slug}.webp` : `/img/w/400/${w.slug}.webp`);
export const byTheme = (key: ThemeKey) => WALLPAPERS.filter((w) => w.theme === key);
export const byCollection = (key: string) => WALLPAPERS.filter((w) => w.collection === key);

/** Vitrine com n obras alternando os temas (variedade sem mostrar o catálogo inteiro). */
export function showcase(n: number): Wallpaper[] {
  const order: ThemeKey[] = ['ocean', 'animals', 'sports', 'cars', 'cities', 'winter', 'classic', 'motivational', 'luxury', 'money', 'countryside', 'still-life', 'noir'];
  const pools = order.map((k) => byTheme(k));
  const out: Wallpaper[] = [];
  for (let i = 0; out.length < n && pools.some((p) => p.length > i); i++) for (const p of pools) if (p[i] && out.length < n) out.push(p[i]);
  return out;
}
export const themeIndexable = (key: ThemeKey) => byTheme(key).length >= MIN_THEME;

/** As 12 obras do pack grátis (uma ou duas de cada tema). */
export const FREE_SLUGS = [
  'tall-ship-open-sea', 'new-york-skyline-toast', 'snow-angel', 'havana-classic-cars', 'galloping-horses', 'shark-school-of-fish',
  'dog-in-the-clouds', 'couple-walking-in-the-rain', 'skiers-snowy-mountain', 'lake-house-golden-hour', 'chess-reflection-water', 'superyacht-sunset',
];
export const FREE_ITEMS = FREE_SLUGS.map((s) => WALLPAPERS.find((w) => w.slug === s)!).filter(Boolean);
