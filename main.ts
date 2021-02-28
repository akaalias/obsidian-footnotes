import {App, MarkdownView, Modal, Plugin} from 'obsidian';

export default class MyPlugin extends Plugin {
	private jumpingOffCursorPosition: CodeMirror.Position;

	async onload() {
		this.addCommand({
			id: 'insert-footnote',
			name: 'Insert Footnote',
			checkCallback: (checking: boolean) => {
				this.insertFootnote(checking);
			},
			hotkeys: [
				{
					modifiers: ["Mod", "Shift"],
					key: "6",
				},
			]
		});
	}

	insertFootnote(checking: boolean) {
		let leaf = this.app.workspace.activeLeaf;
		const mdView = leaf.view as MarkdownView;

		if(mdView.sourceMode == undefined) return false;

		const doc = mdView.sourceMode.cmEditor;

		let editor = doc;
		let markdownText = mdView.data;

		// check if we're in a footnote detail line ("[^1]: footnote")
		// if so, jump cursor back to original line if we have a previous jumping-off point
		let detailLineRegex = /\[\^(\d+)\]\:/;

		const cursorPosition = editor.getCursor();
		let lineText = editor.getLine(cursorPosition.line);
		if(lineText.match(detailLineRegex) && this.jumpingOffCursorPosition != null) {
			editor.setCursor(this.jumpingOffCursorPosition);
			return;
		}

		let re = /\[\^(\d+)\]/gi;
		let matches = markdownText.match(re);
		let numbers: Array<number> = [];
		let currentMax = 1;

		if(matches != null) {
			for(var i = 0; i <= matches.length - 1; i++){
				let match = matches[i];
				match = match.replace("[^", "");
				match = match.replace("]", "");
				let matchNumber = Number(match);
				numbers[i] = matchNumber;
				if(matchNumber + 1 > currentMax) {
					currentMax = matchNumber + 1;
				}
			}
		}

		let footNoteId = currentMax;
		let footnoteMarker = `[^${footNoteId}]`;
		let linePart1 = lineText.substr(0, cursorPosition.ch)
		let linePart2 = lineText.substr(cursorPosition.ch);
		let newLine = linePart1 + footnoteMarker + linePart2

		editor.replaceRange(newLine, {line: cursorPosition.line, ch: 0}, {line: cursorPosition.line, ch: lineText.length})

		let lastLine = editor.getLine(doc.lineCount() - 1);

		if(lastLine.length > 0) {
			editor.replaceRange(`\n[^${footNoteId}]: `, {line: doc.lineCount(), ch: 0})
		} else {
			editor.replaceRange(`[^${footNoteId}]: `, {line: doc.lineCount(), ch: 0})
		}

		this.jumpingOffCursorPosition = editor.getCursor();
		editor.setCursor({line: doc.lineCount(), ch: 6});
	}
}