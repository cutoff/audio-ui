import Knob from "cutoff-audiokit/src/components/Knob.jsx";
import Keyboard from "cutoff-audiokit/src/components/Keyboard.jsx";

export default function App() {
    return (
        <>
            <Knob style={{width: "75px", height: "auto"}}
                min={0} max={100} value={42} label="Coarse" />

            <Keyboard style={{width: "640px", height: "auto"}}
                notesOn="C3 B4 E4 G4" nbKeys={49} startKey="C" startOctave={2} />
        </>
    )
}
