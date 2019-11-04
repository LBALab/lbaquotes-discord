# lbaquotes-discord
Discord App Bot to interact with Little Big Adventure series Quotes

# Usage
Join the Voice channel to hear the original game audio.

Command types:
```
!ping - to known if bot is alive

!lba1 - for random quotes (text only)
!lba1 1 - for specific entry
!lba1 zoe - for random quote with keyword

!lba2 - for random quotes including voice sample streaming
!lba2 2 - for specific entry
!lba2 twinsen - for random quote with keyword
```
Experimental command to register the character who says the quote:

```
!inventory [id] - display inventory item
!inventory [id] [name] [portrait url] - create an inventory item
!inventory magicball
!inventory magicball Magic_Ball

!character [id] - display character portrait
!character [id] [name] [race] [portrait url] - display character portrait
!character jerome Jérôme_Baldino grobo

!who [game] [entry] [character id]
!who lba1 1 twinsen
!who lba2 5 twinsen
```
Note: inventory items and character portrait images can be found at http://twinsuniverse.xesf.net/Main_Page

Inactive feature:
 - The bot will randomly add a game quote every 3h on #lba-quotes.

# Enhancements List

* Help command with usage intructions
* Add LBA2 multi-language text and voice
* Add LBA1 voice samples
* Add LBA1 multi-language text and voice
* Add fan based text translations
* Add special translations (Russion, Japonese)
* Play LBA1 and LBA2 soundtracks
* Improve code readibility
* Remove duplication code
* Separate commands in their own func/file
