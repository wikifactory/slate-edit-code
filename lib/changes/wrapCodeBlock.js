// @flow
import { type Editor } from 'slate';

import type Options from '../options';

import wrapCodeBlockByKey from './wrapCodeBlockByKey';

/**
 * Wrap current block into a code block.
 */
function wrapCodeBlock(opts: Options, editor: Editor): Editor {
    const { value } = editor;
    const { startBlock, selection } = value;

    // Convert to code block
    wrapCodeBlockByKey(opts, editor, startBlock.key);

    // Move selection back in the block
    editor
        .moveToStartOfNode(editor.value.document.getDescendant(startBlock.key))
        .moveAnchorTo(selection.anchor.offset)
        .moveFocusTo(selection.focus.offset);

    return editor;
}

export default wrapCodeBlock;
