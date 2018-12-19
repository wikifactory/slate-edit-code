// @flow
import { isKeyHotkey } from 'is-hotkey';
import { type Editor } from 'slate';

import { getCurrentCode } from '../utils';
import type Options from '../options';

import onTab from './onTab';
import onShiftTab from './onShiftTab';
import onEnter from './onEnter';
import onModEnter from './onModEnter';
import onBackspace from './onBackspace';
import onSelectAll from './onSelectAll';

const isModA = isKeyHotkey('mod+a');
const isShiftTab = isKeyHotkey('shift+tab');
const isTab = isKeyHotkey('tab');
const isModEnter = isKeyHotkey('mod+enter');
const isEnter = isKeyHotkey('enter');
const isBackspace = isKeyHotkey('backspace');

/**
 * User is pressing a key in the editor
 */
function onKeyDown(
    opts: Options,
    event: *,
    editor: Editor,
    next: *
): void | Editor {
    const { value } = editor;
    const currentCode = getCurrentCode(opts, value);

    // Inside code ?
    if (!currentCode) {
        return next();
    }

    // Add opts in the argument list
    const args = [opts, event, editor, next];

    // Select all the code in the block (Mod+a)
    if (opts.selectAll && isModA(event)) {
        return onSelectAll(...args);
    } else if (isShiftTab(event)) {
        // User is pressing Shift+Tab
        return onShiftTab(...args);
    } else if (isTab(event)) {
        // User is pressing Tab
        return onTab(...args);
    } else if (opts.exitBlockType && isModEnter(event)) {
        // User is pressing Mod+Enter
        return onModEnter(...args);
    } else if (isEnter(event)) {
        // User is pressing Enter
        return onEnter(...args);
    } else if (isBackspace(event)) {
        // User is pressing Backspace
        return onBackspace(...args);
    }
    return next();
}

export default onKeyDown;
