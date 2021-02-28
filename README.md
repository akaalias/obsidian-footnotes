## Obsidian Footnotes

Great idea by [jacob.4ristotle](https://forum.obsidian.md/u/jacob.4ristotle/summary) posted in [Footnote Shortcut](https://forum.obsidian.md/t/footnote-shortcut/8872).

> It would be convenient to have a shortcut to automate these steps. In particular, I envision that the shortcut would:
> using the smallest natural number n that has not yet been used for a footnote, 
> * add `[^n]` at the insertion point 
> * add `[^n]: ` to the end of the note, and move the insertion point there.

Hot-key: <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>6</kbd>

![Demo](https://github.com/akaalias/obsidian-footnotes/blob/master/demo.gif?raw=true)

- Given my cursor is where I want a footnote to exist (e.g. `Foo bar baz▊`)
- When I hit <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>6</kbd>
- Then a new footnote marker (e.g. `[^1]`) is inserted where my cursor was (e.g. `Foo bar baz[^1]`)
- And a new footnote details marker (e.g. `[^1]: `) is inserted on the last line of the document
- And my cursor is now placed at the end of the detail marker (e.g. `[^1]: ▊`) 

("6" because this is based on a US keyboard where the uptick character "^" is the shift-value of the same key. Customize hot-key as needed.)

Let me know if you run into any issues!

Cheers, 

Alexis

## Feature Ideas
### Automatically Re-Index Footnotes
Re-index and re-sort all footnotes when you insert a new one in-between one or more existing numbered footnotes:

```markdown
Example sentence[^1] with two footnotes[^2] already.
  
[^1]: Foo
[^2]: Bar
```
- Given there are two footnotes already
- When I enter a new footnote in-between those two
- Then the NEW footnote gets the index "2" 
- And the previously second footnote gets the index "3"
- And the NEW footnote detail is inserted as the second entry at the bottom
- And the previously second footnote detail at the bottom is updated to be "3"
- And the previously second footnote detail at the bottom is updated to be in third position

```markdown
Example sentence[^1] with two[^2] footnotes[^3] already.

[^1]: Foo
[^2]: Baz
[^3]: Bar
```

#### Edge Cases to consider ("What if...?")
- New footnote is inserted before the first footnote 
  ```
  Some sentence[^new] with existing note[^1]
  
  [^1]: Details
  ```
- Text has the same footnote at several places 
  ```
  Some sentence with existing note[^1] and the same[^new] footnote re-appears later[^1].

  
  [^1]: Details
  ```
- Footnote details are spread across the text 
  ```
  Some sentence with existing note[^1] some more text 
  
  [^1]: Inline footnote details
  
  Another text part[^new]
  ```
- The footnote details are multi-line on the bottom
  ```
  Some sentence with existing note[^1] some more text 
  
  [^1]: The details that
  Span across
  Multiple lines
  ```
- There are non-numeric footnotes in the text
  ```
  Some sentence with existing note[^✝] some more text 
  
  [^✝]: Details
  ```

- New footnote is inserted after the last current footnote (default behavior)