/*
 * Copyright (c) 2026 Tylium.
 * SPDX-License-Identifier: GPL-3.0-only OR LicenseRef-TELF
 * See LICENSE.md for details.
 */

// Type definitions for Web MIDI API
// Based on the W3C specification: https://webaudio.github.io/web-midi-api/

declare namespace WebMidi {
    interface MIDIOptions {
        sysex?: boolean;
        software?: boolean;
    }

    // Define MIDIInputMap and MIDIOutputMap with explicit key-value pairs
    interface MIDIInputMap extends Map<string, MIDIInput> {
        get(key: string): MIDIInput | undefined;

        has(key: string): boolean;

        forEach(callbackfn: (value: MIDIInput, key: string, map: Map<string, MIDIInput>) => void): void;
    }

    interface MIDIOutputMap extends Map<string, MIDIOutput> {
        get(key: string): MIDIOutput | undefined;

        has(key: string): boolean;

        forEach(callbackfn: (value: MIDIOutput, key: string, map: Map<string, MIDIOutput>) => void): void;
    }

    interface MIDIAccess extends EventTarget {
        inputs: MIDIInputMap;
        outputs: MIDIOutputMap;
        onstatechange: ((this: MIDIAccess, ev: MIDIConnectionEvent) => void) | null;

        addEventListener(
            type: "statechange",
            listener: (this: MIDIAccess, ev: MIDIConnectionEvent) => void,
            options?: boolean | AddEventListenerOptions
        ): void;

        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;

        removeEventListener(
            type: "statechange",
            listener: (this: MIDIAccess, ev: MIDIConnectionEvent) => void,
            options?: boolean | EventListenerOptions
        ): void;

        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
    }

    interface MIDIPort extends EventTarget {
        id: string;
        manufacturer?: string;
        name?: string;
        type: "input" | "output";
        version?: string;
        state: "connected" | "disconnected";
        connection: "open" | "closed" | "pending";
        onstatechange: ((this: MIDIPort, ev: MIDIConnectionEvent) => void) | null;

        open(): Promise<MIDIPort>;

        close(): Promise<MIDIPort>;

        addEventListener(
            type: "statechange",
            listener: (this: MIDIPort, ev: MIDIConnectionEvent) => void,
            options?: boolean | AddEventListenerOptions
        ): void;

        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;

        removeEventListener(
            type: "statechange",
            listener: (this: MIDIPort, ev: MIDIConnectionEvent) => void,
            options?: boolean | EventListenerOptions
        ): void;

        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
    }

    interface MIDIInput extends MIDIPort {
        type: "input";
        onmidimessage: ((this: MIDIInput, ev: MIDIMessageEvent) => void) | null;

        addEventListener(
            type: "midimessage",
            listener: (this: MIDIInput, ev: MIDIMessageEvent) => void,
            options?: boolean | AddEventListenerOptions
        ): void;

        addEventListener(
            type: "statechange",
            listener: (this: MIDIInput, ev: MIDIConnectionEvent) => void,
            options?: boolean | AddEventListenerOptions
        ): void;

        addEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | AddEventListenerOptions
        ): void;

        removeEventListener(
            type: "midimessage",
            listener: (this: MIDIInput, ev: MIDIMessageEvent) => void,
            options?: boolean | EventListenerOptions
        ): void;

        removeEventListener(
            type: "statechange",
            listener: (this: MIDIInput, ev: MIDIConnectionEvent) => void,
            options?: boolean | EventListenerOptions
        ): void;

        removeEventListener(
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean | EventListenerOptions
        ): void;
    }

    interface MIDIOutput extends MIDIPort {
        type: "output";

        send(data: Uint8Array | number[], timestamp?: number): void;

        clear(): void;
    }

    interface MIDIMessageEvent extends Event {
        data: Uint8Array;
    }

    interface MIDIConnectionEvent extends Event {
        port: MIDIPort;
    }
}

interface Navigator {
    requestMIDIAccess(options?: WebMidi.MIDIOptions): Promise<WebMidi.MIDIAccess>;
}
