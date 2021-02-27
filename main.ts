import {App, MarkdownView, Modal, Plugin} from 'obsidian';

export default class MyPlugin extends Plugin {
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

		const cursorPosition = editor.getCursor();
		let lineText = editor.getLine(cursorPosition.line);
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

		editor.setCursor({line: doc.lineCount(), ch: 6});
	}
}