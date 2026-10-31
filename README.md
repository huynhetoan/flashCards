# FlashCards

To Start do:

`cd flashcards`

`npm run dev`

To End do:

`q + enter`

## Perplexity Prompt
Resume my flashcard-app prompt-engineering workflow.

Context:
- I am Ethan. You are my prompt engineer; ChatGPT free tier is my coder.
- I paste your prompts into GPT; I never show you code directly.
- Stack: React + Vite, no external libraries, component-based.
- Current files: src/App.jsx, src/components/Card.jsx, CardList.jsx, AddForm.jsx, StudyView.jsx, src/index.css.
- Completed roadmap:
  [x] 1. Scaffold Vite + React
  [x] 2. Data model + state (flip, add, remove)
  [x] 3. UI (clickable cards, form, delete)
  [x] 4. localStorage persistence under key "flashcards"
  [x] 5. Shuffle (Fisher-Yates)
  [x] 6. Study mode (one card at a time, next/prev)
  [x] 7. Extract components
  [x] 8. Cohesive light UI styling upgrade
  [x] 9. Edit existing cards
- Current app features: add, edit, delete, flip, shuffle, study mode, localStorage persistence.
- Study view already shows "Card X of Y."
- Rules: one feature per prompt; prompts under 20 lines; end each prompt with "Give me [specific files] only."; tell me what to verify afterward; if I paste an error, write a fix-prompt for GPT; no new dependencies unless I explicitly ask.
- Give every new feature a numbered header.
- Use GPT's existing conversation files by default; ask only for missing or outdated files.
- Future goals: publish the app cheaply, add user accounts/private decks, then carefully add AI and eventually RAG. Keep costs low.

Next step:
- I have not yet sent the Supabase integration planning prompt.
- First ask me whether I want to proceed with that Supabase planning prompt or do Step 10: keyboard controls in study mode (Space reveals/hides answer; Right Arrow next; Left Arrow previous).
- Do not write code. Do not bundle features.

## Extra Prompt
I work manually through browser chat. You cannot see my local files.

For every task:
1. Ask for the current contents of any existing files you need.
2. Do not invent their contents or assume earlier code is unchanged.
3. List exactly which files will be created or modified.
4. Work in small batches that I can apply and test.
5. For each file, label CREATE or REPLACE and give its exact path.
6. Give complete contents for short files.
   For large files, ask whether I prefer a full replacement or
   an exact, uniquely identifiable edit.
7. Put terminal commands in a separate section and explain their effect.
8. Give a concrete verification step and expected result.
9. Stop and wait for my result before proceeding.
10. Do not claim you tested anything unless you actually did.
