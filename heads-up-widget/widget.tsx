// HEADS UP for Scripting — FILE 2 of 3: widget.tsx
// Renders the card on the Home Screen: a photo plus the word. Hold the phone
// to your forehead, friends act it out, then tap Got it or Pass.
// Photos come from hand-picked Wikimedia Commons URLs baked into the deck
// (plus any photo you approved for your own custom words). The widget never
// searches the web by itself. If a photo cannot load, the word still shows on
// a colour card.

import { Button, HStack, Image, Script, Spacer, Text, VStack, Widget, ZStack } from "scripting"
import { deck, getState, HUAction, MODE_LABEL } from "./app_intents"

const C = {
	felt: "#1C3A2E",
	feltDeep: "#122419",
	gold: "#E8C66B",
	ivory: "#F5EFDD",
	dim: "#9DB4A6",
}

// Loads the card's fixed photo URL, caching the bytes on device.
async function loadImage(word: string, url: string | null): Promise<UIImage | null> {
	if (!url) {
		return null
	}
	const key = "hu-img-" + word.toLowerCase()
	try {
		const cached = Storage.getData(key)
		if (cached) {
			const img = UIImage.fromData(cached)
			if (img) {
				return img
			}
		}
		const imgRes = await fetch(url, {timeout: 8})
		if (!imgRes.ok) {
			return null
		}
		const data = await imgRes.data()
		const img = UIImage.fromData(data)
		if (!img) {
			return null
		}
		try {
			const keys = Storage.get("hu-img-keys") as string[] | null
			const list = Array.isArray(keys) ? keys : []
			list.push(key)
			while (list.length > 12) {
				const old = list.shift()
				if (old) {
					Storage.remove(old)
				}
			}
			Storage.set("hu-img-keys", list)
			Storage.setData(key, data)
		} catch (e) {
			// Caching is best effort only.
		}
		return img
	} catch (e) {
		return null
	}
}

async function buildView() {
	const state = getState()
	const cards = deck(state.mode)
	const small = Widget.family === "systemSmall"
	const imgH = small ? 90 : 120

	if (cards.length === 0) {
		return (
			<VStack alignment="center" spacing={8} padding={14} background={C.felt}>
				<Spacer />
				<Text font="headline" foregroundStyle={C.ivory}>
					No custom words yet
				</Text>
				<Text font="caption" foregroundStyle={C.dim}>
					Open the Heads Up script in Scripting to add words, or switch mode.
				</Text>
				<Button title={"Mode: " + MODE_LABEL[state.mode]} intent={HUAction("mode")} buttonStyle="bordered" />
				<Spacer />
			</VStack>
		)
	}

	const card = cards[state.queue[state.pos]]
	const img = await loadImage(card.word, card.img)

	const art = img ? (
		<Image
			image={img}
			resizable
			scaleToFill
			frame={{maxWidth: "infinity", maxHeight: "infinity"}}
		/>
	) : (
		<VStack
			alignment="center"
			background={C.feltDeep}
			frame={{maxWidth: "infinity", maxHeight: "infinity"}}
		>
			<Spacer />
			<Text font="title" fontWeight="bold" foregroundStyle={C.gold}>
				{card.word.charAt(0).toUpperCase()}
			</Text>
			<Spacer />
		</VStack>
	)

	return (
		<VStack alignment="center" spacing={0} background={C.felt}>
			<HStack spacing={8} padding={{top: 8, leading: 12, trailing: 12, bottom: 4}}>
				<Text font="caption" fontWeight="bold" foregroundStyle={C.gold}>
					{MODE_LABEL[state.mode]}
				</Text>
				<Spacer />
				<Text font="caption" foregroundStyle={C.ivory}>
					{"✓ " + state.correct + "   ✗ " + state.passed}
				</Text>
			</HStack>

			<VStack spacing={0} padding={{leading: 10, trailing: 10}}>
				<ZStack alignment="bottom" frame={{height: imgH}}>
					{art}
					<VStack
						alignment="center"
						padding={6}
						background="rgba(0, 0, 0, 0.55)"
						frame={{maxWidth: "infinity"}}
					>
						<Text font={small ? "headline" : "title"} fontWeight="bold" foregroundStyle="#FFFFFF">
							{card.word}
						</Text>
					</VStack>
				</ZStack>
			</VStack>

			<HStack spacing={8} padding={{top: 8, bottom: 10}}>
				<Button title="Pass" intent={HUAction("pass")} buttonStyle="bordered" />
				<Button title="Got it" intent={HUAction("correct")} buttonStyle="borderedProminent" />
				<Button title="Mode" systemImage="arrow.triangle.2.circlepath" intent={HUAction("mode")} buttonStyle="borderless" />
			</HStack>
		</VStack>
	)
}

Widget.present(await buildView())
Script.exit()
