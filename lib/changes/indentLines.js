// @flow
import { type Editor } from 'slate';

import type Options from '../options';

/**
 * Indent all lines in selection
 */
function indentLines(
    opts: Options,
    editor: Editor,
    // Indent to add
    indent: string
): Editor {
    const { value } = editor;
    const { document, selection } = value;
    const lines = document
        .getBlocksAtRange(selection)
        .filter(node => node.type === opts.lineType);

    return lines.reduce((c, line) => {
        // Insert an indent at start of line
        const text = line.nodes.first();
        return c.insertTextByKey(text.key, 0, indent);
    }, editor);
}

export default indentLines;
