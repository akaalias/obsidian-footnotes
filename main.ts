import { MarkdownView, Plugin } from 'obsidian';
import * as _ from "lodash";

export default class MyPlugin extends Plugin {

	private detailLineRegex = /\[\^(\d+)\]\:/;
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
		const markdownText = mdView.data;

		if (this.shouldJumpFromDetailToMarker(lineText, cursorPosition, doc)) return;
		if (this.shouldJumpFromMarkerToDetail(lineText, cursorPosition, doc)) return;

		return this.shouldCreateNewFootnote(lineText, cursorPosition, doc, markdownText);
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

	private shouldCreateNewFootnote(lineText: string, cursorPosition: CodeMirror.Position, doc: CodeMirror.Editor, markdownText: string) {

		// get all footnotes, including markers
		let allFootnotesRegex = /\[\^\d+\]\:?/ig;
		let footnotesByLine = [];

		let footnotesBeforeCursor = [];
		let footnotesAfterCursor = [];

		for (let i = 0; i < doc.lineCount(); i++) {
			let theLine = doc.getLine(i);
			footnotesByLine[i] = [];
			let lineMatches = [...theLine.matchAll(allFootnotesRegex)];
			if (lineMatches.length != 0) {
				for (let j = 0; j < lineMatches.length; j++) {
					let type = "normal";
					if(lineMatches[j][0].match(/\[\^.*\]\:/)) type = "detail";
					if(lineMatches[j][0].match(/\^\[.*\]/)) type = "inline";
					let footnote = {line: i, text: lineMatches[j][0], type: type, index: lineMatches[j].index}

					if(cursorPosition.line > i) footnotesBeforeCursor.push(footnote);
					if(cursorPosition.line == i) {
						if(cursorPosition.ch > footnote.index) footnotesBeforeCursor.push(footnote);
						if(cursorPosition.ch < footnote.index) footnotesAfterCursor.push(footnote);
					}
					if(cursorPosition.line < i) footnotesAfterCursor.push(footnote);
				}
			}
		}

		const footnotesBeforeCursorMarkersOnly = footnotesBeforeCursor.filter(item => item.type != "detail");
		const footnotesBeforeCursorMarkersOnlyUnique = _.uniqBy(footnotesBeforeCursorMarkersOnly, 'text');
		const footnotesAfterCursorMarkersOnly = footnotesAfterCursor.filter(item => item.type != "detail");


		console.log("unique before:");
		console.log(footnotesBeforeCursorMarkersOnlyUnique);

		let newMarkerIndex = footnotesBeforeCursorMarkersOnlyUnique.length + 1;

		// finally set the footnote and move the cursor
		let footnoteMarker = `[^${newMarkerIndex}]`;
		let linePart1 = lineText.substr(0, cursorPosition.ch)
		let linePart2 = lineText.substr(cursorPosition.ch);
		let newLine = linePart1 + footnoteMarker + linePart2

		doc.replaceRange(newLine, {line: cursorPosition.line, ch: 0}, {line: cursorPosition.line, ch: lineText.length})

		let lastLine = doc.getLine(doc.lineCount() - 1);

		let footnoteDetail = `[^${newMarkerIndex}]: `;

		if (lastLine.length > 0) {
			doc.replaceRange("\n" + footnoteDetail, {line: doc.lineCount(), ch: 0})
		} else {
			doc.replaceRange(footnoteDetail, {line: doc.lineCount(), ch: 0})
		}

		doc.setCursor({line: doc.lineCount(), ch: footnoteDetail.length});



		// these need to be updated
		for(var i = 0; i < footnotesAfterCursorMarkersOnly.length; i++) {

			let footnote = footnotesAfterCursorMarkersOnly[i];
			let theLine = doc.getLine(footnote.line);

			let match = footnote.text.match(this.numericalRe);
			if (match) {
				let indexString = match[0];
				let markerIndex = Number(indexString);
				let incrementIndex = markerIndex + 1;

				console.log("Reindexing..." + markerIndex);

				let newMarker = "[^" + incrementIndex +"]";

				let theNewLine = theLine.replace(footnote.text, newMarker);

				doc.replaceRange(newMarker, {line: footnote.line, ch: footnote.index + footnoteMarker.length}, {line: footnote.line, ch: footnote.index + footnoteMarker.length + newMarker.length})
			}
		}
	}
}