## Obsidian Footnotes Plugin

This hotkey lets you:

- Insert a new footnote marker (e.g. `[^1]`) with auto-incremented index in your text 
    - Adds the footnote detail (e.g. `[^1]: `) at the bottom of your text 
    - Places your cursor so you can fill in the details quickly
- Jump from your footnote TO the footnote detail
- Jump from your footnote detail BACK to the footnote 
- New in January 2022: Automatic re-indexing of footnotes

![Overview](https://github.com/akaalias/obsidian-footnotes/blob/master/basic.gif?raw=true)

## IMPORTANT: You must to set up your footnote hotkey

After installing and activating this plugin, you still have to SET UP your hotkey. This is easy and quick:

`Settings -> Hotkeys -> Search for "Footnote" -> Customize Command -> Your preferred hotkey`

I personally use <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>6</kbd> because "6" on a US keyboard is where the uptick/footnote character "^" is.

![Hotkey](https://github.com/akaalias/obsidian-footnotes/blob/master/hotkey.png?raw=true)

## Default Feature Details
### Scenario: No previous numeric (e.g. "[^1]") footnotes exist:
- Given my cursor is where I want a footnote to exist (e.g. `Foo bar baz▊`)
- When I hit `my footnote hotkey`
- Then a new footnote marker (e.g. `[^1]`) is inserted where my cursor was (e.g. `Foo bar baz[^1]`)
- And a new footnote details marker (e.g. `[^1]: `) is inserted on the last line of the document
- And my cursor is now placed at the end of the detail marker (e.g. `[^1]: ▊`)

### Scenario: Previous numeric (e.g. "[^1]") footnotes exist:
- Given there is one or more numeric footnotes in my text 
- And my cursor is where I want a footnote to exist (e.g. `Foo bar[^1] baz▊`)
- When I hit `my footnote hotkey`
- Then a new footnote marker with the next numeric index (e.g. `[^2]`) is inserted where my cursor was (e.g. `Foo bar[^1] baz[^2]`)
- And a new footnote details marker (e.g. `[^2]: `) is inserted on the last line of the document
- And my cursor is now placed at the end of the detail marker (e.g. `[^2]: ▊`)

### Scenario: Footnote is inserted in between existing footnotes
- All existing footnotes get updated and the new one inserted as in the previous Scenarios

### Scenario: Jumping TO a footnote detail
- Given I'm on a footnote detail line (e.g. `[^1]: ▊`)
- When I hit `my footnote hotkey`
- Then my cursor is placed right after the *first* occurence of this footnote in my text (e.g. `[^1]▊`)

### Scenario: Jumping BACK to a footnote
- Given I'm on - or next to - a footnote (e.g. `[^1]▊`) in my text
- When I hit `my footnote hotkey`
- Then my cursor is placed to the right of the footnote (e.g. `[^1]: ▊`)

### Known Limitations or Untested Scenarios
#### Manually Deleting Footnotes or Copy-Pasting Text Chunks
Because the plugin only gets triggered when it is manually invoked for example by pressing the hotkey, this is an unsolved issue.

## Background
This plugin is based on the great idea by [jacob.4ristotle](https://forum.obsidian.md/u/jacob.4ristotle/summary) posted in the ["Footnote Shortcut"](https://forum.obsidian.md/t/footnote-shortcut/8872) thread.

> **Use case or problem:**
>
> I use Obsidian to take school notes, write essays and so on, and I find myself needing to add frequent footnotes. Currently, to add a new footnote, I need to:
> - scroll to the bottom to check how many footnotes I already have
> - type [^n] in the body of the note, where n is the next number
> - move to the end of the note, type [^n] again, and then add my citation.
>
> **Proposed solution:**
>
> It would be convenient to have a shortcut to automate these steps. In particular, I envision that the shortcut would:
> Using the smallest natural number n that has not yet been used for a footnote
> - add `[^n]` at the insertion point
> - add `[^n]: ` to the end of the note, and move the insertion point there.