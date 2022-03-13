# Greg-Saves-The-World
Web based game made using the PIXI.JS library

[Link to Game](https://people.rit.edu/jpd2690/235/project3/project3.html)

---

## What is the game about?
Greg saves the world is a simplistic 2d platformer staring Greg during the apocalypse. He must overcome 3 distinct enemy types and a quickening pace of stage movement to stay alive for as long as possible. The game is set up as an endless auto scroller that progressively gets more difficult as time increases. Enemy spawn rates and the pace of the stage both increase, as well as the stats of the enemies. The player has a set health pool and no way to heal up. Once the player loses all their health or falls off the screen, the game ends.

---

## Controls
The player can strafe, jump, and shoot in the game. They strafe with the A, D or left right arrow keys, jump with W, space bar, or up arrow, fast fall with S or down arrow, and shoot with the left mouse button. They shoot in the direction where their cursor is facing.

---

## Enemy Types

### Gunners
Gunners descend from the sky firing bullets in a straight line. If left unchecked they will obliterate the player, but their slow descent and initial lockout phase where they can't fire bullets allow them to be answered quickly. Their health and descent rate scale up as the game goes on.

### Ghosts
Ghosts are small and quick enemies that spawn off screen and dash directly at the player. Upon impact they damage the player and are knocked back. They ignore platforms and their speed scales with the game time, along with thier health.

### Auras
Auras are static enemies that only damage you if you collide with them. They spawn at around the same level as the platforms spawn and they move with the stage, making them a nuisance that has to be dealt with. They have large health pools and warp bullets that pass by them with their intense gravity. Their health scales with the game time.
