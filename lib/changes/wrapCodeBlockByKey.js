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
    editor.withoutNormalizing(() => {
        startBlock.nodes.forEach(node => {
            editor.removeNodeByKey(node.key);
        });
    });

    // Insert new text
    const toInsert = deserializeCode(opts, text);

    editor.withoutNormalizing(() => {
        toInsert.nodes.forEach((node, i) => {
            editor.insertNodeByKey(startBlock.key, i, node);
        });
    });

    // Set node type
    editor.setNodeByKey(startBlock.key, {
        type: opts.containerType
    });

    return editor;
}

export default wrapCodeBlockByKey;
