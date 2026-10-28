// HEADS UP for Scripting — FILE 1 of 3: app_intents.tsx
// Holds the word decks, the shared game state, and the widget button logic.
// widget.tsx and index.tsx both import from this file.
//
// Photos: every built-in card carries a fixed Wikimedia Commons photo that was
// picked and reviewed by hand, so the widget never searches the open web.
// Custom words only ever show a photo YOU approved in the app screen; without
// an approved photo the card falls back to a big first letter.

import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"

export type Mode = "family" | "cheeky" | "custom"
export type Card = {word: string; img: string | null}
export type CustomEntry = {word: string; img: string | null}
export type HUState = {
	mode: Mode
	queue: number[]
	pos: number
	correct: number
	passed: number
}

const STORE_KEY = "heads-up-state-v1"
export const CUSTOM_KEY = "heads-up-custom-entries"

export const MODE_LABEL: Record<Mode, string> = {
	family: "FAMILY",
	cheeky: "18+ CHEEKY",
	custom: "CUSTOM",
}

const MODE_ORDER: Mode[] = ["family", "cheeky", "custom"]

// ---------------------------------------------------------------------------
// Decks. "img" is a hand-picked, reviewed Wikimedia Commons photo per card.
// 18+ CHEEKY is wordplay and visual puns only: cheeky words, clean photos.
// ---------------------------------------------------------------------------

export const FAMILY: Card[] = [
	{word: "Cricket", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/72/Master_Blaster_at_work.jpg/500px-Master_Blaster_at_work.jpg"},
	{word: "Biryani", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Shrimp_Biriyani.JPG/500px-Shrimp_Biriyani.JPG"},
	{word: "Taj Mahal", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Taj_Mahal%2C_Agra%2C_India_edit2.jpg/500px-Taj_Mahal%2C_Agra%2C_India_edit2.jpg"},
	{word: "Auto Rickshaw", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Tuk-tuk_taxi_sidecar_in_Laos.jpg/500px-Tuk-tuk_taxi_sidecar_in_Laos.jpg"},
	{word: "Elephant", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/500px-African_Bush_Elephant.jpg"},
	{word: "Diwali", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/Diwali_Diyas_1.jpg/500px-Diwali_Diyas_1.jpg"},
	{word: "Cutting Chai", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Masala_Chai.jpg/500px-Masala_Chai.jpg"},
	{word: "Peacock", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Paonroue.JPG/500px-Paonroue.JPG"},
	{word: "Samosa", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Samosa_4.jpg/500px-Samosa_4.jpg"},
	{word: "Mango", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Mangos_-_single_and_halved.jpg/500px-Mangos_-_single_and_halved.jpg"},
	{word: "Yoga", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Woman_sitting_on_a_yoga_mat_with_her_legs_crossed_and_checking_her_phone.jpg/500px-Woman_sitting_on_a_yoga_mat_with_her_legs_crossed_and_checking_her_phone.jpg"},
	{word: "Kite Flying", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/RAF_Ahmedabad_Kite_Flying_Festival_Paavan_Solanki.jpg/500px-RAF_Ahmedabad_Kite_Flying_Festival_Paavan_Solanki.jpg"},
	{word: "Holi", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Barsana_Holi_Festival.jpg/500px-Barsana_Holi_Festival.jpg"},
	{word: "Dosa", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Masala_dosa_01.jpg/500px-Masala_dosa_01.jpg"},
	{word: "Sleeper Train", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Indian_Railways_Train_in_2025.jpg/500px-Indian_Railways_Train_in_2025.jpg"},
	{word: "Monsoon", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Monsoon_rain_in_Yangon%2C_Myanmar%2C_20160812_082637.jpg/500px-Monsoon_rain_in_Yangon%2C_Myanmar%2C_20160812_082637.jpg"},
	{word: "Ludo", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Ludo_board_game.jpg/500px-Ludo_board_game.jpg"},
	{word: "Chess", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/40/Chess_game_Staunton_No._6_perfil_view_8.jpg/500px-Chess_game_Staunton_No._6_perfil_view_8.jpg"},
	{word: "Tabla", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Tabla._-_Flickr_-_boulanger.IE.jpg/500px-Tabla._-_Flickr_-_boulanger.IE.jpg"},
	{word: "Sitar", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Sitar_player.jpg/500px-Sitar_player.jpg"},
	{word: "Guitar", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e0/Man_playing_an_acoustic_brazilian_guitar_%28Viol%C3%A3o%29_on_Marco_Zero_Square%2C_Refice%2C_Pernambuco%2C_Brazil.jpg/500px-Man_playing_an_acoustic_brazilian_guitar_%28Viol%C3%A3o%29_on_Marco_Zero_Square%2C_Refice%2C_Pernambuco%2C_Brazil.jpg"},
	{word: "Selfie", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Selfie_V%C3%A9lib%2C_Paris_2014_%28cropped%29.jpg/500px-Selfie_V%C3%A9lib%2C_Paris_2014_%28cropped%29.jpg"},
	{word: "Helicopter", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/LAPD_Bell_206_Jetranger.jpg/500px-LAPD_Bell_206_Jetranger.jpg"},
	{word: "Tiger", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Bengal_tiger_%28Panthera_tigris_tigris%29_female_3.jpg/500px-Bengal_tiger_%28Panthera_tigris_tigris%29_female_3.jpg"},
	{word: "Monkey", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Rhesus_macaque_%28Macaca_mulatta_mulatta%29%2C_male%2C_Gokarna.jpg/500px-Rhesus_macaque_%28Macaca_mulatta_mulatta%29%2C_male%2C_Gokarna.jpg"},
	{word: "Fisherman", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Fisherman_at_Muzhappilangad_Beach.jpg/500px-Fisherman_at_Muzhappilangad_Beach.jpg"},
	{word: "Farmer", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg/500px-Gianyar-Regency_Bali_Indonesia_A-rice-farmer-working-in-his-paddy-01.jpg"},
	{word: "Barber", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Barber_shop%2C_Quebec_city%2C_Canada.jpg/500px-Barber_shop%2C_Quebec_city%2C_Canada.jpg"},
	{word: "Mehndi", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/HENNA-189.jpg/500px-HENNA-189.jpg"},
	{word: "Chef", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Chef_cooking_fish_from_Lake_Malawi.jpg/500px-Chef_cooking_fish_from_Lake_Malawi.jpg"},
	{word: "Doctor", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/2023_Stetoskop.jpg/500px-2023_Stetoskop.jpg"},
	{word: "Football", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Adidas_soccer_ball_on_a_grass_pitch_%28Unsplash%29.jpg/500px-Adidas_soccer_ball_on_a_grass_pitch_%28Unsplash%29.jpg"},
	{word: "Basketball", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Basketball%2C_1._Damen-Basketball-Bundesliga%2C_ChemCats_Chemnitz_LR10_by_Stepro_IMG_7684.jpg/500px-Basketball%2C_1._Damen-Basketball-Bundesliga%2C_ChemCats_Chemnitz_LR10_by_Stepro_IMG_7684.jpg"},
	{word: "Swimming", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/North_Sydney_Olympic_Pool.jpg/500px-North_Sydney_Olympic_Pool.jpg"},
	{word: "Pizza", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7e/Vegetarian_Pizza.jpg/500px-Vegetarian_Pizza.jpg"},
	{word: "Ice Cream", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Ice_cream_cone_with_spoon.jpg/500px-Ice_cream_cone_with_spoon.jpg"},
	{word: "Birthday Cake", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Italy_-_birthday_cake_with_candles_5.jpg/500px-Italy_-_birthday_cake_with_candles_5.jpg"},
	{word: "Big Fat Wedding", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Indian_Wedding_Accessories.jpg/500px-Indian_Wedding_Accessories.jpg"},
	{word: "Traffic Jam", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Traffic_Congestion_-_Mathura_Road_-_New_Delhi_2014-05-13_2739.JPG/500px-Traffic_Congestion_-_Mathura_Road_-_New_Delhi_2014-05-13_2739.JPG"},
	{word: "Goa Beach", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Mandrem_Beach_and_Mandrem_River%2C_Mandrem%2C_Goa%2C_India_%28edit%29.jpg/500px-Mandrem_Beach_and_Mandrem_River%2C_Mandrem%2C_Goa%2C_India_%28edit%29.jpg"},
]

export const CHEEKY: Card[] = [
	{word: "Pawn Star", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Schachfiguren%2C_Bauern_--_2022_--_0022_%28bw%29.jpg/500px-Schachfiguren%2C_Bauern_--_2022_--_0022_%28bw%29.jpg"},
	{word: "Morning Wood", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/A_stack_of_logs_-_geograph.org.uk_-_6180569.jpg/500px-A_stack_of_logs_-_geograph.org.uk_-_6180569.jpg"},
	{word: "Beach Please", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Havelock_Island%2C_Mangrove_tree_on_the_beach%2C_Andaman_Islands.jpg/500px-Havelock_Island%2C_Mangrove_tree_on_the_beach%2C_Andaman_Islands.jpg"},
	{word: "Sofa King", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Reception_lounge_at_Amantaka_luxury_Resort_%26_Hotel_at_blue_hour_in_Luang_Prabang_Laos.jpg/500px-Reception_lounge_at_Amantaka_luxury_Resort_%26_Hotel_at_blue_hour_in_Luang_Prabang_Laos.jpg"},
	{word: "Just the Tip", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Glacial_iceberg_in_Argentina.jpg/500px-Glacial_iceberg_in_Argentina.jpg"},
	{word: "Nice Melons", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/%D8%A7%D9%84%D8%A8%D8%B7%D9%8A%D8%AE_%D8%A7%D9%84%D8%A3%D8%AD%D9%85%D8%B1.JPG/500px-%D8%A7%D9%84%D8%A8%D8%B7%D9%8A%D8%AE_%D8%A7%D9%84%D8%A3%D8%AD%D9%85%D8%B1.JPG"},
	{word: "Big Nuts", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/Liat_Portal_for_Foodie_Disorder_-_Mixed_nuts_and_dried_fruit.jpg/500px-Liat_Portal_for_Foodie_Disorder_-_Mixed_nuts_and_dried_fruit.jpg"},
	{word: "Chestnuts", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/45/Gebarsten_bolster_van_een_paardenkastanje_%28Aesculus%29_20-09-2020_%28d.j.b.%29_01.jpg/500px-Gebarsten_bolster_van_een_paardenkastanje_%28Aesculus%29_20-09-2020_%28d.j.b.%29_01.jpg"},
	{word: "Knockers", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Nizza_door_knocker-20160406-RM-190501.jpg/500px-Nizza_door_knocker-20160406-RM-190501.jpg"},
	{word: "Nice Rack", img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Smallwinecube.jpg"},
	{word: "Foxy Lady", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Alaska_Red_Fox_%28Vulpes_vulpes%29.jpg/500px-Alaska_Red_Fox_%28Vulpes_vulpes%29.jpg"},
	{word: "Chick Magnet", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/VFPt_horseshoe-magnet.svg/500px-VFPt_horseshoe-magnet.svg.png"},
	{word: "Stud Muffin", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Plain_vanilla_muffin_in_Tuntorp.jpg/500px-Plain_vanilla_muffin_in_Tuntorp.jpg"},
	{word: "Happy Ending", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/58/Sunset_2007-1.jpg/500px-Sunset_2007-1.jpg"},
	{word: "One Night Stand", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Antique_bedside_table_-_Casa_Loma.jpg/500px-Antique_bedside_table_-_Casa_Loma.jpg"},
	{word: "Netflix and Chill", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Woman_sitting_on_a_couch_watching_television_while_covered_with_a_blanket.jpg/500px-Woman_sitting_on_a_couch_watching_television_while_covered_with_a_blanket.jpg"},
	{word: "Slide into DMs", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Playground_in_Freiham_03.jpg/500px-Playground_in_Freiham_03.jpg"},
	{word: "Catfish", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Aquarium_tropical_de_Pierrefitte-Nestalas_03082018_Clarias_batrachus_2.jpg/500px-Aquarium_tropical_de_Pierrefitte-Nestalas_03082018_Clarias_batrachus_2.jpg"},
	{word: "He's a Snack", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Potato-Chips.jpg/500px-Potato-Chips.jpg"},
	{word: "Eggplant", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/500px-Solanum_melongena_24_08_2012_%281%29.JPG"},
	{word: "Peach", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Autumn_Red_peaches.jpg/500px-Autumn_Red_peaches.jpg"},
	{word: "Cherry Pop", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Cherry_Stella444.jpg/500px-Cherry_Stella444.jpg"},
	{word: "Banana Split", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9f/Traditional_Banana_Boat.jpg/500px-Traditional_Banana_Boat.jpg"},
	{word: "Bottoms Up", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/3_beer_glasses_toast.jpg/500px-3_beer_glasses_toast.jpg"},
	{word: "Sugar Daddy", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/W%C3%BCrfelzucker_--_2018_--_3564.jpg/500px-W%C3%BCrfelzucker_--_2018_--_3564.jpg"},
	{word: "Gold Digger", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/Garzweiler_surface_mine_Bucket-wheel_excavator_2019_1.jpg/500px-Garzweiler_surface_mine_Bucket-wheel_excavator_2019_1.jpg"},
	{word: "Cougar", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Puma_%28Puma_concolor%29_-_20191228.jpg/500px-Puma_%28Puma_concolor%29_-_20191228.jpg"},
	{word: "Hot Buns", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Hot_cross_buns_-_fig_and_pecan.jpg/500px-Hot_cross_buns_-_fig_and_pecan.jpg"},
	{word: "Ass-tonishing", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Equus_asinus_Kadzid%C5%82owo_001.jpg/500px-Equus_asinus_Kadzid%C5%82owo_001.jpg"},
	{word: "Muffin Top", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Muffin_NIH.jpg/500px-Muffin_NIH.jpg"},
	{word: "Full Package", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/94/Christmas_gifts_or_presents.jpg/500px-Christmas_gifts_or_presents.jpg"},
	{word: "Hard Wood", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Scuffed_parquet_flooring.jpg/500px-Scuffed_parquet_flooring.jpg"},
	{word: "Wiener Dog", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Teckel_-_39.jpg/500px-Teckel_-_39.jpg"},
	{word: "Hot Dog", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Abeles_heymann_beef_hot_dog_package.jpg/500px-Abeles_heymann_beef_hot_dog_package.jpg"},
	{word: "Fowl Play", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Hen_with_chicks%2C_Raisen_district%2C_MP%2C_India.jpg/500px-Hen_with_chicks%2C_Raisen_district%2C_MP%2C_India.jpg"},
	{word: "Holy Cow", img: "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/500px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg"},
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export function getCustomEntries(): CustomEntry[] {
	const raw = Storage.get(CUSTOM_KEY)
	if (!Array.isArray(raw)) {
		return []
	}
	const entries: CustomEntry[] = []
	for (const item of raw) {
		if (typeof item === "string" && item.trim().length > 0) {
			entries.push({word: item, img: null})
		} else if (
			item &&
			typeof item === "object" &&
			typeof item.word === "string" &&
			item.word.trim().length > 0
		) {
			entries.push({word: item.word, img: typeof item.img === "string" ? item.img : null})
		}
	}
	return entries
}

export function saveCustomEntries(entries: CustomEntry[]) {
	Storage.set(CUSTOM_KEY, entries)
}

export function deck(mode: Mode): Card[] {
	if (mode === "family") {
		return FAMILY
	}
	if (mode === "cheeky") {
		return CHEEKY
	}
	return getCustomEntries()
}

export function newQueue(size: number): number[] {
	const queue = Array.from({length: size}, (_, i) => i)
	for (let i = queue.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const t = queue[i]
		queue[i] = queue[j]
		queue[j] = t
	}
	return queue
}

function freshState(): HUState {
	return {mode: "family", queue: newQueue(FAMILY.length), pos: 0, correct: 0, passed: 0}
}

function isPermutation(queue: unknown, size: number): queue is number[] {
	if (!Array.isArray(queue) || queue.length !== size) {
		return false
	}
	const seen = new Set<number>()
	for (const i of queue) {
		if (!Number.isInteger(i) || i < 0 || i >= size || seen.has(i)) {
			return false
		}
		seen.add(i)
	}
	return true
}

export function getState(): HUState {
	const raw = Storage.get(STORE_KEY)
	if (!raw || typeof raw !== "object") {
		const fresh = freshState()
		Storage.set(STORE_KEY, fresh)
		return fresh
	}
	const state = raw as Partial<HUState>
	const mode: Mode =
		state.mode === "cheeky" || state.mode === "custom" ? state.mode : "family"
	const size = deck(mode).length
	if (size === 0) {
		// Custom mode with no words yet: valid state, widget shows instructions.
		const empty: HUState = {mode, queue: [], pos: 0, correct: 0, passed: 0}
		Storage.set(STORE_KEY, empty)
		return empty
	}
	const correct = typeof state.correct === "number" ? state.correct : 0
	const passed = typeof state.passed === "number" ? state.passed : 0
	if (
		!isPermutation(state.queue, size) ||
		!Number.isInteger(state.pos) ||
		state.pos === undefined ||
		state.pos < 0 ||
		state.pos >= size
	) {
		const repaired: HUState = {mode, queue: newQueue(size), pos: 0, correct, passed}
		Storage.set(STORE_KEY, repaired)
		return repaired
	}
	return {mode, queue: state.queue, pos: state.pos, correct, passed}
}

export function saveState(state: HUState) {
	Storage.set(STORE_KEY, state)
}

function applyAction(action: string) {
	const state = getState()
	if (action === "mode") {
		const next = MODE_ORDER[(MODE_ORDER.indexOf(state.mode) + 1) % MODE_ORDER.length]
		const size = deck(next).length
		saveState({mode: next, queue: newQueue(size), pos: 0, correct: 0, passed: 0})
		return
	}
	if (action === "restart") {
		saveState({mode: state.mode, queue: newQueue(state.queue.length), pos: 0, correct: 0, passed: 0})
		return
	}
	if (state.queue.length === 0) {
		return
	}
	if (action === "correct" || action === "pass") {
		if (action === "correct") {
			state.correct += 1
		} else {
			state.passed += 1
		}
		state.pos += 1
		if (state.pos >= state.queue.length) {
			// Deck finished: reshuffle and keep the score running.
			state.queue = newQueue(state.queue.length)
			state.pos = 0
		}
		saveState(state)
	}
}

export const HUAction = AppIntentManager.register({
	name: "HUAction",
	protocol: AppIntentProtocol.AppIntent,
	perform: async (action: string) => {
		applyAction(action)
		Widget.reloadAll()
	},
})
