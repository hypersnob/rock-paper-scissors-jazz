# Hard Rock Paper Scissors - interactive social game

**What I want to build**: interactive social rock, paper, scissors game

**Tech stack**:

- React
- typescript
- jazz-tools
- tailwind css
- @tanstack/react-router

## Jazz tools schema requirements

A user account owns a list of games

Every game should contain:

- host move: ["ROCK", "PAPER", "SCISSORS"]
- player move: ["ROCK", "PAPER", "SCISSORS"] | null
- winner: ["HOST", "PLAYER", "DRAW"] | null
- question: string | null
- host account ID: string
- player account ID: string | null
- date created: string
- date completed: string | null
- is archived: boolean

## Account view

User will get two list of games with following structure:

- My games:

  - Date created e.g. 31.10.2025 14:12, question
    - Date completed, player name, winner
    - ...

- Guest games
  - Host name
    - Date completed, winner
    - ...

## App logic

**From the game host perspective:**

- At first visit a local account @https://jazz.tools/docs/react/key-features/authentication/overview will be created, user will have the possibility to edit they name
- The user makes a move, optionally can add the question the game result should answer e.g. "My place or yours?" the game will be created and they will be redirected to the game url /game_id with a possibility to share the link
- The user will have an option to create a permanent account using passkey @https://jazz.tools/docs/react/key-features/authentication/passkey
- On a secondary visits or after an accout was created user will have an access to the game lists

**From the player perspective:**

- User visits game page /game_id and has possibility to make a secondary move they see the name of the game host and, optionaly, the question
- After it they will see the result e.g. you won/you have lost/ you have a tie
- is the player visit the already played game secondary he will see the result only

## What I would like to have

- Feasibility check. e.g. whether is it possible to access games I have participated in but not being the owner of for the review list?
- Jazz Tools schema suggestion
- Possible game/app flow or schema improvements
- Implementation plan with subtasks
