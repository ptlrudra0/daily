// HEADS UP for Scripting — FILE 3 of 3: index.tsx
// The screen you see when you open the script inside the Scripting app:
// pick the mode, and manage your custom words. Every custom word can get a
// photo that YOU approve here first - nothing unreviewed reaches the widget.
// The game itself plays on the Home Screen widget.

import {
	Button,
	HStack,
	Image,
	Navigation,
	Picker,
	Script,
	ScrollView,
	Spacer,
	Text,
	TextField,
	useState,
	VStack,
	Widget,
} from "scripting"
import {
	deck,
	getCustomEntries,
	getState,
	newQueue,
	saveCustomEntries,
	saveState,
} from "./app_intents"

function refreshWidget() {
	try {
		Widget.reloadAll()
	} catch (e) {
		// Reload is best effort from the app.
	}
}

// Searches Wikimedia Commons for a candidate photo. Offset picks later
// results when you tap "Try another".
async function findCandidate(word: string, offset: number): Promise<string | null> {
	const api =
		"https://commons.wikimedia.org/w/api.php?action=query&format=json" +
		"&prop=imageinfo&iiprop=url&iiurlwidth=500&generator=search" +
		"&gsrnamespace=6&gsrlimit=1&gsroffset=" +
		offset +
		"&gsrsearch=" +
		encodeURIComponent(word)
	const res = await fetch(api, {timeout: 10})
	if (!res.ok) {
		return null
	}
	const json = await res.json()
	const pages = json && json.query ? json.query.pages : null
	if (!pages) {
		return null
	}
	const first = Object.values(pages)[0] as any
	const thumb = first && first.imageinfo && first.imageinfo[0] ? first.imageinfo[0].thumburl : null
	return typeof thumb === "string" ? thumb : null
}

function MainPage() {
	const [tick, setTick] = useState(0)
	const [draft, setDraft] = useState("")
	const [candidate, setCandidate] = useState<string | null>(null)
	const [candidateWord, setCandidateWord] = useState("")
	const [candidateOffset, setCandidateOffset] = useState(0)
	const [searching, setSearching] = useState(false)
	const [searchFailed, setSearchFailed] = useState(false)

	const state = getState()
	const entries = getCustomEntries()

	const bump = () => setTick(tick + 1)

	const setMode = (m: string) => {
		const mode = m === "cheeky" || m === "custom" ? m : "family"
		const size = deck(mode).length
		saveState({mode, queue: newQueue(size), pos: 0, correct: 0, passed: 0})
		refreshWidget()
		bump()
	}

	const resetCustomQueue = () => {
		const s = getState()
		if (s.mode === "custom") {
			s.queue = newQueue(getCustomEntries().length)
			s.pos = 0
			saveState(s)
		}
	}

	const search = async (word: string, offset: number) => {
		setSearching(true)
		setSearchFailed(false)
		try {
			const url = await findCandidate(word, offset)
			setCandidate(url)
			setCandidateWord(word)
			setCandidateOffset(offset)
			setSearchFailed(url === null)
		} catch (e) {
			setCandidate(null)
			setSearchFailed(true)
		}
		setSearching(false)
	}

	const findPhoto = () => {
		const w = draft.trim()
		if (w.length === 0) {
			return
		}
		search(w, 0)
	}

	const tryAnother = () => {
		search(candidateWord, candidateOffset + 1)
	}

	const commit = (img: string | null) => {
		const w = candidateWord.trim()
		if (w.length === 0) {
			return
		}
		const list = getCustomEntries()
		if (!list.some(x => x.word.toLowerCase() === w.toLowerCase())) {
			list.push({word: w, img})
			saveCustomEntries(list)
			resetCustomQueue()
		}
		setCandidate(null)
		setCandidateWord("")
		setDraft("")
		refreshWidget()
		bump()
	}

	const removeWord = (w: string) => {
		saveCustomEntries(getCustomEntries().filter(x => x.word !== w))
		resetCustomQueue()
		refreshWidget()
		bump()
	}

	return (
		<ScrollView>
			<VStack alignment="leading" spacing={16} padding={16}>
				<Text font="title" fontWeight="bold">
					Heads Up
				</Text>
				<Text font="footnote" foregroundStyle="gray">
					Add the widget to your Home Screen, hold the phone to your forehead, and your
					friends act out the word and photo. Tap Got it or Pass on the widget.
				</Text>

				<Text font="headline">Mode</Text>
				<Picker value={state.mode} onChanged={setMode} pickerStyle="segmented">
					<Text tag="family">Family</Text>
					<Text tag="cheeky">18+ Cheeky</Text>
					<Text tag="custom">Custom</Text>
				</Picker>
				<Text font="caption" foregroundStyle="gray">
					18+ Cheeky is wordplay and visual puns only. Cheeky words, clean photos.
				</Text>

				<Text font="headline">{"Custom words (" + entries.length + ")"}</Text>
				<HStack spacing={8}>
					<TextField
						title="Word"
						value={draft}
						onChanged={setDraft}
						prompt="Type a word, e.g. Kite"
					/>
					<Button title="Find photo" action={findPhoto} buttonStyle="borderedProminent" />
				</HStack>

				{searching ? <Text font="footnote" foregroundStyle="gray">Searching for a photo...</Text> : null}

				{candidate !== null ? (
					<VStack alignment="leading" spacing={8}>
						<Text font="footnote">{"Photo for “" + candidateWord + "” - approve it before it can appear:"}</Text>
						<Image imageUrl={candidate} resizable scaleToFit frame={{height: 180}} />
						<HStack spacing={8}>
							<Button title="Use this photo" action={() => commit(candidate)} buttonStyle="borderedProminent" />
							<Button title="Try another" action={tryAnother} buttonStyle="bordered" />
							<Button title="No photo" action={() => commit(null)} buttonStyle="borderless" />
						</HStack>
					</VStack>
				) : null}

				{searchFailed ? (
					<VStack alignment="leading" spacing={8}>
						<Text font="footnote" foregroundStyle="gray">
							No photo found. The word will show as a letter card, or try again.
						</Text>
						<Button title={"Add “" + candidateWord + "” without photo"} action={() => commit(null)} buttonStyle="bordered" />
					</VStack>
				) : null}

				{entries.map(e => (
					<HStack key={e.word} spacing={8}>
						<Text>{e.word + (e.img ? "  📷" : "")}</Text>
						<Spacer />
						<Button
							title="Remove"
							systemImage="trash"
							role="destructive"
							buttonStyle="borderless"
							action={() => removeWord(e.word)}
						/>
					</HStack>
				))}
				{entries.length === 0 ? (
					<Text font="caption" foregroundStyle="gray">
						Custom mode uses your words. You approve each photo here before it can
						appear on the widget.
					</Text>
				) : null}

				<Text font="headline">Widget setup</Text>
				<Text font="caption" foregroundStyle="gray">
					Long-press the Home Screen, tap +, choose Scripting, pick the medium widget,
					then Edit Widget and select this script. Do the same for Chor-Chitthi with its
					own script project.
				</Text>
			</VStack>
		</ScrollView>
	)
}

Navigation.present({element: <MainPage />})
Script.exit()
