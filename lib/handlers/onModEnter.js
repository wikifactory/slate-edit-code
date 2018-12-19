// @flow
import { type Editor } from 'slate';

import type Options from '../options';

/**
 * User pressed Mod+Enter in an editor
 * Exit the current code block
 */
function onModEnter(
    opts: Options,
    event: *,
    editor: Editor,
    next: *
): void | Editor {
    const { value } = editor;
    if (!value.isCollapsed) {
        return next();
    }

    event.preventDefault();

    // Exit the code block
    return opts.resolvedOnExit(change);
}

export default onModEnter;
