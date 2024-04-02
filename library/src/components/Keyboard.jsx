import React from 'react';

const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const notesCount = noteNames.length;

const positiveModulo = (number, modulus) => {
    return ((number % modulus) + modulus) % modulus;
}

export default function Keyboard(
    {
        nbKeys = 61,
        startKey = (nbKeys === 88) ? 'A' : 'C',
        startOctave = 2,
        notesOn,
        style
    }) {

    const myStyle = {
        backgroundColor: "#f6f6f605",
        border: "0 0 0 0",
        ...style
    }

    const nbOctaves = Math.floor(nbKeys / 12);
    const keyRemainder = nbKeys % 12;

    const nbWhite = nbOctaves * 7 + keyRemainder;
    const whiteWidth = 25;
    const outerStrokeWidth = 2;
    const innerStrokeWidth = 2;
    const width = nbWhite * whiteWidth;
    const whiteHeight = 150;
    const blackWidth = 13;
    const blackXShift = 18;

    const blackHeight = whiteHeight / 3 * 2;
    const blackKeyShift = parseInt('C', 36) - parseInt(startKey, 36);

    const blackPass = [positiveModulo(2 + blackKeyShift, 7), positiveModulo(6 +  blackKeyShift, 7)];

    const startKeyIndex = noteNames.indexOf(startKey);

    let renderWhiteKeys = [];
    let renderBlackKeys = [];
    for (let index = 0; index < nbWhite; index++) {
        const currentNoteIndex = (startKeyIndex + index) % notesCount;
        const currentNoteName = noteNames[currentNoteIndex];
        const currentOctave = startOctave + Math.floor((startKeyIndex + index) / notesCount);
        const currentWhiteNote = currentNoteName + currentOctave.toString();
        const whiteNoteFillClass = (notesOn?.includes(currentWhiteNote) ? "fill-primary" : "fill-transparent")
        let octaveIndex = index % 7;
        let pass = (index === nbWhite - 1) || blackPass.includes(octaveIndex);
        if (!pass) {
            const currentBlackNote = currentNoteName + "#" + currentOctave.toString();
            const blackNoteFillClass = (notesOn?.includes(currentBlackNote) ? "fill-primary" : "fill-primary-50")
            renderBlackKeys.push(
                <rect key={currentBlackNote}
                      className={`stroke-primary-50 ${blackNoteFillClass}`}
                      style={{zIndex: 1}}
                      strokeWidth={innerStrokeWidth}
                      x={index * whiteWidth + blackXShift}
                      y={0}
                      width={blackWidth}
                      height={blackHeight}
                />
            );
        }
        renderWhiteKeys.push(
                <rect key={currentWhiteNote}
                      className={`stroke-primary-50 ${whiteNoteFillClass}`}
                      strokeWidth={innerStrokeWidth}
                      x={index * whiteWidth}
                      y={0}
                      width={whiteWidth}
                      height={whiteHeight}
                />
        );
    }

    return (
        <div style={myStyle}>
            <svg viewBox={`0 0 ${width} ${whiteHeight}`}
                // preserveAspectRatio="0.25"
                // style={{backgroundColor: "#f6f6f610"}}
            >
                <rect className="stroke-primary-50 fill-transparent"
                      strokeWidth={outerStrokeWidth}
                      x={outerStrokeWidth / 2}
                      y={outerStrokeWidth / 2}
                      width={width - outerStrokeWidth}
                      height={whiteHeight - outerStrokeWidth}
                />

                {renderWhiteKeys}
                {renderBlackKeys}
            </svg>
        </div>
    );
}