import { MarkdownView, Plugin } from 'obsidian';

export default class MyPlugin extends Plugin {

	private detailLineRegex = /\[\^(\d+)\]\:/;
	private reOnlyDetails = /\[\^(\d+)\]\:/gi;
	private reOnlyMarkers = /\[\^(\d+)\]/gi;
	private numericalRe = /(\d+)/


	async onload() {
		this.addCommand({
			id: 'insert-footnote',
			name: 'Insert and Navigate Footnote',
			checkCallback: (checking: boolean) => {
				if (checking) return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				this.insertFootnote();
			}
		});
	}

	insertFootnote() {
		const mdView = this.app.workspace.getActiveViewOfType(MarkdownView);

		if (!mdView) return false
		if (mdView.sourceMode == undefined) return false;

		const doc = mdView.sourceMode.cmEditor;
		const cursorPosition = doc.getCursor();
		const lineText = doc.getLine(cursorPosition.line);

		if (this.shouldJumpFromDetailToMarker(lineText, cursorPosition, doc)) return;
		if (this.shouldJumpFromMarkerToDetail(lineText, cursorPosition, doc)) return;

		return this.shouldCreateNewFootnote(lineText, cursorPosition, doc);
	}

	private shouldJumpFromDetailToMarker(lineText: string, cursorPosition: CodeMirror.Position, doc: CodeMirror.Editor) {
		// check if we're in a footnote detail line ("[^1]: footnote")
		// if so, jump cursor back to the footnote in the text
		// https://github.com/akaalias/obsidian-footnotes#improved-quick-navigation
		let match = lineText.match(this.detailLineRegex)
		if (match) {
			let s = match[0]
			let index = s.replace("[^", "");
			index = index.replace("]:", "");
			let footnote = s.replace(":", "");

			let returnLineIndex = cursorPosition.line;
			// find the FIRST OCCURENCE where this footnote exists in the text
			for (let i = 0; i < doc.lineCount(); i++) {
				let scanLine = doc.getLine(i);
				if (scanLine.contains(footnote)) {
					let cursorLocationIndex = scanLine.indexOf(footnote);
					returnLineIndex = i;
					doc.setCursor({line: returnLineIndex, ch: cursorLocationIndex + footnote.length});
					return true;
				}
			}
		}

		return false;
	}

	private shouldJumpFromMarkerToDetail(lineText: string, cursorPosition: CodeMirror.Position, doc: CodeMirror.Editor) {
		// Jump cursor TO detail marker
		// check if the cursor is inside or left or right of a footnote in a line
		// if so, jump cursor to the footnote detail line
		// https://github.com/akaalias/obsidian-footnotes#improved-quick-navigation

		// does this line have a footnote marker?
		// does the cursor overlap with one of them?
		// if so, which one?
		// find this footnote marker's detail line
		// place cursor there
		let reOnlyMarkersMatches = lineText.match(this.reOnlyMarkers);

		let markerTarget = null;

		if (reOnlyMarkersMatches) {
			for (let i = 0; i <= reOnlyMarkersMatches.length; i++) {
				let marker = reOnlyMarkersMatches[i];
				if (marker != undefined) {
					let indexOfMarkerInLine = lineText.indexOf(marker);
					if (cursorPosition.ch >= indexOfMarkerInLine && cursorPosition.ch <= indexOfMarkerInLine + marker.length) {
						markerTarget = marker;
						break;
					}
				}
			}
		}

		if (markerTarget != null) {
			// extract index
			let match = markerTarget.match(this.numericalRe);
			if (match) {
				let indexString = match[0];
				let markerIndex = Number(indexString);

				// find the first line with this detail marker index in it.
				for (let i = 0; i < doc.lineCount(); i++) {
					let theLine = doc.getLine(i);
					let lineMatch = theLine.match(this.detailLineRegex);
					if (lineMatch) {
						// compare to the index
						let indexMatch = lineMatch[1];
						let indexMatchNumber = Number(indexMatch);
						if (indexMatchNumber == markerIndex) {
							doc.setCursor({line: i, ch: lineMatch[0].length});
							return true;
						}
					}
				}
			}
		}
		return false;
	}

	private shouldCreateNewFootnote(lineText: string, cursorPosition: CodeMirror.Position, doc: CodeMirror.Editor) {
		// create new footnote with the next numerical index
		let numbers: Array<number> = [];
		let currentMax = 1;
		let match

		// search highest footnote ID of footnotes before the cursor position
		let beforeCursor = doc.getRange({line: 0, ch: 0}, doc.getCursor());

		while ((match = this.reOnlyMarkers.exec(beforeCursor)) !== null) {
			if (Number(match[1]) + 1 > currentMax) {
				currentMax = Number(match[1]) + 1;
			}
		}
		let footNoteId = currentMax;

		// increment footnote IDs after the cursor position
		// only IDs bigger or equal to the new ID will be incremented in case an earlier one is used more than once
		// this also includes the footnote details which is fine since we need to increment those anyways
		let afterCursor = doc.getRange(doc.getCursor(), {line: doc.lastLine(), ch: doc.getLine(doc.lastLine()).length});

		while ((match = this.reOnlyMarkers.exec(afterCursor)) !== null) {
			if (Number(match[1]) >= footNoteId) {
				const p = doc.offsetToPos(beforeCursor.length+match.index);
				doc.replaceRange(String(Number(match[1])+1), {line: p.line, ch: p.ch + 2}, {line: p.line, ch: p.ch + 3});
			}
		}

		// add new footnote marker
		let footnoteMarker = `[^${footNoteId}]`;
		doc.replaceRange(footnoteMarker, doc.getCursor())

		// add new footnote detail
		// search for the correct place first
		let footnoteDetail = `[^${footNoteId}]: `;

		while ((match = this.reOnlyDetails.exec(afterCursor)) !== null) {
			if (Number(match[1]) == footNoteId) {
				const p = doc.offsetToPos(beforeCursor.length + match.index + footnoteMarker.length);
				doc.replaceRange(footnoteDetail + '\n', {line: p.line, ch: 0});
				doc.setCursor({line: p.line, ch: footnoteDetail.length});
				return;
			}
		}
		// if no footnote details where found just add a line to the bottom of the document
		if (footNoteId == 1) {
			// this is just for aesthetics 
			doc.replaceRange('\n', {line: doc.lastLine(), ch: doc.getLine(doc.lastLine()).length});
		}
		doc.replaceRange('\n' + footnoteDetail, {line: doc.lastLine(), ch: doc.getLine(doc.lastLine()).length});
		doc.setCursor({line: doc.lastLine(), ch: footnoteDetail.length});
	}
}