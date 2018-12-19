// @flow
import { type Editor } from 'slate';

import type Options from '../options';

/**
 * Unwrap a code block into a normal block.
 */
function unwrapCodeBlockByKey(
    opts: Options,
    editor: Editor,
    key: string,
    type: string
): Editor {
    const { value } = editor;
    const { document } = value;

    // Get the code block
    const codeBlock = document.getDescendant(key);

    if (!codeBlock || codeBlock.type != opts.containerType) {
        throw new Error(
            'Block passed to unwrapCodeBlockByKey should be a code block container'
        );
    }

    // change lines into paragraph
    editor.withoutNormalizing(() => {
        codeBlock.nodes.forEach(line =>
            editor.setNodeByKey(line.key, { type }).unwrapNodeByKey(line.key)
        );
    });

    return editor;
}

export default unwrapCodeBlockByKey;
