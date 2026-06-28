# Hiểu Rõ Design

## Visual Thesis

Hiểu Rõ feels like a premium accessibility language room: ink-dark focus, expressive hands, ivory sentence fragments, muted teal clarity, and amber warmth without charity tropes.

## Product Read

The product helps Deaf community members and supporters convert Vietnamese sentences influenced by sign-language order, missing word order, or near-word choices into clearer written Vietnamese. The homepage should explain that this is not about judging the writer; it is about bridging language structure with consent and privacy.

## Homepage Structure

1. Hero: full-bleed sign-language/writing image, clear non-judgment promise, two actions.
2. Support: concrete example from sign-order-influenced Vietnamese to written Vietnamese.
3. Detail: privacy and dignity for personal writing and consented samples.
4. Final CTA: start from one real sentence.

## Motion System

- Hero image slowly breathes with a subtle scale/pan.
- Ink-light overlay drifts across the hero and app shell.
- Content reveals upward once, with hover lift on primary actions and feature rows.
- `prefers-reduced-motion` disables continuous motion.

## Image Assets

Generated with the built-in image generation path and saved into:

- `public/images/home-hero-writing.png`
- `public/images/home-lesson-flow.png`
- `public/images/logo-mark.png`

### Hero Prompt

Use case: photorealistic-natural. Asset type: full-bleed landing page hero background for a Vietnamese accessibility writing app serving Deaf users. Create a premium cinematic image about a Deaf Vietnamese person moving between sign language and written Vietnamese. Scene: quiet community learning room in Vietnam at dusk, warm practical lights, desk with notebook and laptop showing abstract unreadable line blocks. Subject: two Vietnamese young adults in natural conversation, one using Vietnamese sign language gestures and another writing notes. Composition: ultra-wide, calm dark negative space on the left, human interaction on the right. Avoid readable text, logos, medical imagery, hearing-aid closeups, pity tone, distorted hands, and fake app screens.

### Support Prompt

Use case: photorealistic-natural. Asset type: supporting homepage section image for a Vietnamese Deaf accessibility writing app. Create a tactile visual about converting a sentence influenced by sign-language order into clear written Vietnamese. Scene: close-up desk with paper strips, notebook, tablet, and hands arranging fragments into a clean sequence. All writing is abstract unreadable marks. Avoid readable text, logos, sign-language alphabet charts, medical imagery, pity tone, and distorted hands.

### Logo Prompt

Use case: logo-brand. Asset type: transparent website logo mark for a Vietnamese writing coach app. Create a premium app logo mark for "Hiểu Rõ" without any text, representing clarity in Vietnamese writing. Subject: elegant ink stroke forming an open page and a small clarity spark/check mark. Style: refined vector-friendly logo rendered as clean high-resolution raster. Composition: centered square logo mark, no wordmark, no letters. Palette: deep ink navy, muted teal, small warm amber highlight, ivory negative space. Generated on a flat chroma background, then exported to `logo-mark.png` with alpha.

## Global Design Rules

- Keep product UI calm and useful; homepage can be cinematic, app pages stay readable.
- Use real imagery for the public story, not abstract gradient-only backgrounds.
- Reuse existing React/Tailwind primitives; no new animation dependency.
- Use one primary accent, teal, with amber only as a warm highlight.
- Use non-judgmental language: no "sai tiếng Việt", no "không biết tiếng Việt"; frame the problem as language-structure bridging.
