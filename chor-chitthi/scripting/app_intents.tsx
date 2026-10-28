// CHOR-CHITTHI for Scripting — FILE 1 of 2: app_intents.tsx
// Handles the widget button taps. Also holds the shared game state logic,
// which widget.tsx imports.

import { AppIntentManager, AppIntentProtocol, Widget } from "scripting"

type Phase = "choose" | "pass" | "reveal" | "done"
export type GameState = {
	mode: 4 | 6
	seats: number[]
	current: number
	phase: Phase
}

const STORE_KEY = "chor-chitthi-state-v2"

export function shuffled(count: number): number[] {
	const seats = Array.from({length: count}, (_, i) => i)
	for (let i = seats.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const t = seats[i]
		seats[i] = seats[j]
		seats[j] = t
	}
	return seats
}

function freshState(): GameState {
	return {mode: 4, seats: [], current: 0, phase: "choose"}
}

function isExactDeal(mode: number, seats: unknown): seats is number[] {
	if (!Array.isArray(seats) || seats.length !== mode) {
		return false
	}
	const seen = new Set<number>()
	for (const seat of seats) {
		if (!Number.isInteger(seat) || seat < 0 || seat >= mode || seen.has(seat)) {
			return false
		}
		seen.add(seat)
	}
	return true
}

// Turns anything stored into a safe state. A valid deal with broken progress
// restarts at seat 1 so no role ever leaks; anything worse falls back to the
// choose screen.
function repair(raw: unknown): GameState {
	if (!raw || typeof raw !== "object") {
		return freshState()
	}
	const state = raw as Partial<GameState>
	if (state.mode !== 4 && state.mode !== 6) {
		return freshState()
	}
	const mode = state.mode
	if (state.phase === "choose") {
		return {mode, seats: [], current: 0, phase: "choose"}
	}
	if (!isExactDeal(mode, state.seats)) {
		return freshState()
	}
	const current = state.current
	if (
		(state.phase === "pass" || state.phase === "reveal") &&
		Number.isInteger(current) &&
		current !== undefined &&
		current >= 0 &&
		current < mode
	) {
		return {mode, seats: state.seats, current, phase: state.phase}
	}
	if (state.phase === "done" && current === mode) {
		return {mode, seats: state.seats, current, phase: "done"}
	}
	return {mode, seats: state.seats, current: 0, phase: "pass"}
}

export function getState(): GameState {
	const state = repair(Storage.get(STORE_KEY))
	Storage.set(STORE_KEY, state)
	return state
}

function save(state: GameState) {
	Storage.set(STORE_KEY, state)
}

function applyAction(action: string) {
	const state = getState()
	if (action === "choose4" || action === "choose6") {
		const mode = action === "choose4" ? 4 : 6
		save({mode, seats: shuffled(mode), current: 0, phase: "pass"})
		return
	}
	if (action === "reveal" && state.phase === "pass") {
		state.phase = "reveal"
		save(state)
		return
	}
	if (action === "hide" && state.phase === "reveal") {
		state.current += 1
		state.phase = state.current >= state.mode ? "done" : "pass"
		save(state)
		return
	}
	if (action === "redeal") {
		state.seats = shuffled(state.mode)
		state.current = 0
		state.phase = "pass"
		save(state)
		return
	}
	if (action === "reset") {
		save(freshState())
	}
}

export const CCAction = AppIntentManager.register({
	name: "CCAction",
	protocol: AppIntentProtocol.AppIntent,
	perform: async (action: string) => {
		applyAction(action)
		Widget.reloadAll()
	},
})
