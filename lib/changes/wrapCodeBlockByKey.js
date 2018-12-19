// @flow
import { type Editor } from 'slate';

import type Options from '../options';
import { deserializeCode } from '../utils';

/**
 * Wrap a block into a code block.
 */
function wrapCodeBlockByKey(
    opts: Options,
    editor: Editor,
    key: string
): Editor {
    const { value } = editor;
    const { document } = value;

    const startBlock = document.getDescendant(key);
    const text = startBlock.text;

    // Remove all child
    startBlock.nodes.forEach(node => {
        editor.removeNodeByKey(node.key, { normalize: false });
    });

    // Insert new text
    const toInsert = deserializeCode(opts, text);

    toInsert.nodes.forEach((node, i) => {
        editor.insertNodeByKey(startBlock.key, i, node, { normalize: false });
    });

    // Set node type
    editor.setNodeByKey(startBlock.key, {
        type: opts.containerType
    });

    return editor;
}

export default wrapCodeBlockByKey;
