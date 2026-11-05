# T-Pay style lock

Status: merge of the owner's two reference mock-ups, 2026-11-05. Animation and component libraries still pending.
Tokens: frontend/src/theme/tokens.ts is the only place colours, type, spacing and motion values live.

## Direction
From the lime reference: folder-shaped cards with a raised tab and notch pill, cards stacked behind one another, navy chart panel, lime and navy.
From the lilac reference: white panels with a small top dent, round icon actions, rounded bar chart with a bubble, segmented control, floating dark menu, grey-white page.

## Rules from the owner
- Colours come only from the references. No outside status colours.
- No gradients in the app.
- Intuitive for someone with no technology experience, so every menu item keeps its word.
- Subtle animation. Libraries are chosen by the owner.

## Colour contract
Page #F2F4EE. Ink #0D1B36. Lime #B3EE4A. Lilac #8A79F1. Peach #FECC82. White panels.
Text on lime, lilac and peach is always ink. Text on ink is white or #C9D0DD.
Status: Paid lime, Pending peach, Locked pale lilac, Refused ink. Each also has its word.

## Type
Lexend for titles and money. Inter for body. Inter covers the Hausa letters Lexend lacks; money and titles still need a Hausa check.

## Motion
Values from the interfaces better-ui skill: press 0.96 over 150ms, entrances 12px over 300ms with 100ms stagger, tabular numbers.

## Signature patterns
- Amounts appear with a pile of notes.
- Amounts are entered by tapping notes, with typing as the fallback.
- Payment confirms with press and hold. Letting go cancels.
- Each balance card has Hear it in its notch.
