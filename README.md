## Obsidian Footnotes

Great idea by [jacob.4ristotle](https://forum.obsidian.md/u/jacob.4ristotle/summary) posted in [Footnote Shortcut](https://forum.obsidian.md/t/footnote-shortcut/8872).

> It would be convenient to have a shortcut to automate these steps. In particular, I envision that the shortcut would:
> using the smallest natural number n that has not yet been used for a footnote, 
> * add `[^n]` at the insertion point 
> * add `[^n]: ` to the end of the note, and move the insertion point there.

That's what this does. 

This plugin adds a new hot-key <kbd>Command</kbd>+<kbd>Shift</kbd>+<kbd>6</kbd> that when hit will insert a footnote with increased counter and move your cursor to the bottom of the file, add the other footnote pair and lets you type away...

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