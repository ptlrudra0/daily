// CHOR-CHITTHI for Scripting — FILE 2 of 2: widget.tsx
// Renders the widget on the Home Screen. Pick 4 or 6 players, pass the phone
// seat to seat. Each player taps to see their role alone, hides it, passes on.
// No names, no scoring. The rest of the game happens in the room.

import { Button, HStack, Script, Spacer, Text, VStack, Widget } from "scripting"
import { CCAction, getState } from "./app_intents"

const ROLES: Record<number, {name: string; blurb: string}[]> = {
	4: [
		{name: "RAJA", blurb: "The king. Untouchable."},
		{name: "RANI", blurb: "The queen. Royal blood."},
		{name: "WAZIR", blurb: "The minister. Name the Chor."},
		{name: "CHOR", blurb: "The thief. Act innocent."},
	],
	6: [
		{name: "RAJA", blurb: "The king. Untouchable."},
		{name: "RANI", blurb: "The queen. Royal blood."},
		{name: "WAZIR", blurb: "The minister. Name the Chor."},
		{name: "CHOR", blurb: "The thief. Act innocent."},
		{name: "RANI'S BROTHER", blurb: "Blood of the queen."},
		{name: "SIPAHI", blurb: "The soldier. Loyal blade."},
	],
}

const C = {
	burgundy: "#4A0E1C",
	ivory: "#F3EAD8",
	gold: "#D6B673",
	dim: "#B9A98F",
}

function WidgetView() {
	const state = getState()

	let body
	if (state.phase === "choose") {
		body = (
			<VStack spacing={10} alignment="center">
				<Text font="headline" fontWeight="bold" foregroundStyle={C.gold}>
					CHOR-CHITTHI
				</Text>
				<Text font="caption" foregroundStyle={C.dim}>
					Pass the phone. No peeking.
				</Text>
				<HStack spacing={10}>
					<Button title="4 Players" intent={CCAction("choose4")} buttonStyle="borderedProminent" />
					<Button title="6 Players" intent={CCAction("choose6")} buttonStyle="borderedProminent" />
				</HStack>
			</VStack>
		)
	} else if (state.phase === "pass") {
		body = (
			<VStack spacing={8} alignment="center">
				<Text font="caption" foregroundStyle={C.dim}>
					PLAYER {state.current + 1} OF {state.mode}
				</Text>
				<Text font="headline" foregroundStyle={C.ivory}>
					Your chitthi is face down
				</Text>
				<Button
					title="Reveal my role"
					systemImage="eye"
					intent={CCAction("reveal")}
					buttonStyle="borderedProminent"
					controlSize="large"
				/>
			</VStack>
		)
	} else if (state.phase === "reveal") {
		const role = ROLES[state.mode][state.seats[state.current]]
		body = (
			<VStack spacing={6} alignment="center">
				<Text font="caption" foregroundStyle={C.dim}>
					ONLY YOU CAN SEE THIS
				</Text>
				<Text font="title" fontWeight="bold" foregroundStyle={C.gold}>
					{role.name}
				</Text>
				<Text font="footnote" foregroundStyle={C.ivory}>
					{role.blurb}
				</Text>
				<Button
					title="Hide and pass"
					systemImage="eye.slash"
					intent={CCAction("hide")}
					buttonStyle="borderedProminent"
					controlSize="large"
				/>
			</VStack>
		)
	} else {
		body = (
			<VStack spacing={8} alignment="center">
				<Text font="headline" foregroundStyle={C.gold}>
					All roles assigned
				</Text>
				<Text font="caption" foregroundStyle={C.dim}>
					Wazir names the Chor. Play it out in the room.
				</Text>
				<HStack spacing={10}>
					<Button title="Redeal" intent={CCAction("redeal")} buttonStyle="bordered" />
					<Button title="New table" intent={CCAction("reset")} buttonStyle="bordered" />
				</HStack>
			</VStack>
		)
	}

	return (
		<VStack alignment="center" spacing={8} padding={14} background={C.burgundy}>
			<Spacer />
			{body}
			<Spacer />
		</VStack>
	)
}

Widget.present(<WidgetView />)
Script.exit()
