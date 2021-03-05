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

		const cursorPosition = editor.getCursor();
		let lineText = editor.getLine(cursorPosition.line);

		// check if we're in a footnote detail line ("[^1]: footnote")
		// if so, jump cursor back to the footnote in the text
		// https://github.com/akaalias/obsidian-footnotes#improved-quick-navigation
		let detailLineRegex = /\[\^(\d+)\]\:/;
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

		// Jump cursor TO detail marker
		// check if the cursor is inside or left or right of a footnote in a line
		// if so, jump cursor to the footnote detail line
		// https://github.com/akaalias/obsidian-footnotes#improved-quick-navigation

		// does this line have a footnote marker?
		// does the cursor overlap with one of them?
		// if so, which one?
		// find this footnote marker's detail line
		// place cursor there
		let reOnlyMarkers = /\[\^(\d+)\]/gi;
		let reOnlyMarkersMatches = lineText.match(reOnlyMarkers);

		let markerTarget = null;

		if(reOnlyMarkersMatches) {
			for(let i = 0; i <= reOnlyMarkersMatches.length; i++) {
				let marker = reOnlyMarkersMatches[i];
				if(marker != undefined) {
					let indexOfMarkerInLine = lineText.indexOf(marker);
					console.log(indexOfMarkerInLine);
					if(cursorPosition.ch >= indexOfMarkerInLine && cursorPosition.ch <= indexOfMarkerInLine + marker.length) {
						markerTarget = marker;
						break;
					}
				}
			}
		}

		if(markerTarget != null) {
			console.log("Let's continue moving the cursor to where the marker detail is...");
			// extract index
			let numericalRe = /(\d+)/
			let match = markerTarget.match(numericalRe);
			if(match) {
				let indexString = match[0];
				let markerIndex = Number(indexString);
				console.log(markerIndex);

				// find the first line with this detail marker index in it.
				for(let i = 0; i < editor.lineCount(); i++) {
					let detailLineRegex = /\[\^(\d+)\]\:/;
					let theLine = editor.getLine(i);
					let lineMatch = theLine.match(detailLineRegex);
					if(lineMatch) {
						// compare to the index
						let indexMatch = lineMatch[1];
						let indexMatchNumber = Number(indexMatch);

						if(indexMatchNumber == markerIndex){
							editor.setCursor({line: i, ch: lineMatch[0].length});
							break;
						}
					}
				}
			}
			return;
		}

		// create new footnote with the next numerical index
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