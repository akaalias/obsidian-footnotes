import {App, MarkdownView, Modal, Plugin, Workspace} from 'obsidian';

export default class MyPlugin extends Plugin {
	private jumpingOffCursorPosition: CodeMirror.Position;

	async onload() {
		this.addCommand({
			id: 'insert-footnote',
			name: 'Insert Footnote',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.insertFootnote();
			}
		});
	}

	insertFootnote() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if(!mdView) { return false}

		if(mdView.sourceMode == undefined) return false;

		const doc = mdView.sourceMode.cmEditor;

		let editor = doc;
		let markdownText = mdView.data;

		// check if we're in a footnote detail line ("[^1]: footnote")
		// if so, jump cursor back to the footnote in the text
		let detailLineRegex = /\[\^(\d+)\]\:/;
		const cursorPosition = editor.getCursor();
		let lineText = editor.getLine(cursorPosition.line);
		let match = lineText.match(detailLineRegex)
		if(match) {
			let s = match[0]
			let index = s.replace("[^", "");
			index = index.replace("]:", "");
			let footnote = s.replace(":", "");

			let returnLineIndex = cursorPosition.line;
			// find the FIRST OCCURENCE where this footnote exists in the text
			for(let i = 0; i < doc.lineCount(); i++) {
				let scanLine = doc.getLine(i);
				if(scanLine.contains(footnote)) {
					let cursorLocationIndex = scanLine.indexOf(footnote);
					returnLineIndex = i;
					editor.setCursor({line: returnLineIndex, ch: cursorLocationIndex + footnote.length});
					return;
				}
			}
		}

		let re = /\[\^(\d+)\]/gi;
		let matches = markdownText.match(re);
		let numbers: Array<number> = [];
		let currentMax = 1;

		if(matches != null) {
			for(let i = 0; i <= matches.length - 1; i++){
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

		let footnoteDetail = `[^${footNoteId}]: `;

		if(lastLine.length > 0) {
			editor.replaceRange("\n" + footnoteDetail, {line: doc.lineCount(), ch: 0})
		} else {
			editor.replaceRange(footnoteDetail, {line: doc.lineCount(), ch: 0})
		}

		this.jumpingOffCursorPosition = editor.getCursor();
		editor.setCursor({line: doc.lineCount(), ch: footnoteDetail.length});
	}
}