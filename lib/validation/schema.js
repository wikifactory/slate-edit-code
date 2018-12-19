// @flow

import { Block, type Editor, type Node } from 'slate';
import {
    CHILD_TYPE_INVALID,
    CHILD_INVALID,
    PARENT_TYPE_INVALID,
    PARENT_INVALID,
    CHILD_OBJECT_INVALID
} from 'slate-schema-violations';
import { List } from 'immutable';

import type Options from '../options';
import { deserializeCode } from '../utils';

/**
 * Create a schema definition with rules to normalize code blocks
 */
function schema(opts: Options): Object {
    const baseSchema = {
        blocks: {
            [opts.containerType]: {
                nodes: [{ types: [opts.lineType] }],
                normalize(editor: Editor, error: SlateError) {
                    const { code } = error;
                    switch (code) {
                        case CHILD_INVALID:
                        case CHILD_TYPE_INVALID:
                            return onlyLine(opts, editor, error);
                        default:
                            return undefined;
                    }
                }
            },
            [opts.lineType]: {
                nodes: [{ objects: ['text'], min: 1 }],
                parent: { types: [opts.containerType] },
                normalize(editor: Editor, error) {
                    const { code } = error;
                    switch (code) {
                        // This constant does not exist yet in
                        // official Slate, but exists in GitBook's
                        // fork. Until the PR is merged, we accept both
                        // https://github.com/ianstormtaylor/slate/pull/1842
                        case PARENT_INVALID:
                        case PARENT_TYPE_INVALID:
                            return noOrphanLine(opts, editor, error);
                        case CHILD_INVALID:
                        case CHILD_OBJECT_INVALID:
                            return onlyTextInCode(opts, editor, error);
                        default:
                            return undefined;
                    }
                }
            }
        }
    };

    if (!opts.allowMarks) {
        baseSchema.blocks[opts.lineType].marks = [];
    }

    return baseSchema;
}

/**
 * Return a list of group of nodes matching the given filter.
 */
function getSuccessiveNodes(
    nodes: List<Node>,
    match: Node => boolean
): List<List<Node>> {
    const nonLines = nodes.takeUntil(match);
    const afterNonLines = nodes.skip(nonLines.size);
    if (afterNonLines.isEmpty()) {
        return List();
    }

    const firstGroup = afterNonLines.takeWhile(match);
    const restOfNodes = afterNonLines.skip(firstGroup.size);

    return List([firstGroup]).concat(getSuccessiveNodes(restOfNodes, match));
}

/**
 * A rule that ensure code blocks only contain lines of code, and no marks
 */
function onlyLine(opts: Options, editor: Editor, error: Object) {
    const isNotLine = n => n.type !== opts.lineType;
    const nonLineGroups = getSuccessiveNodes(error.node.nodes, isNotLine);

    nonLineGroups.filter(group => !group.isEmpty()).forEach(nonLineGroup => {
        // Convert text to code lines
        const text = nonLineGroup.map(n => n.text).join('');
        const codeLines = deserializeCode(opts, text).nodes;

        // Insert them in place of the invalid node
        const first = nonLineGroup.first();
        const parent = editor.value.document.getParent(first.key);
        const invalidNodeIndex = parent.nodes.indexOf(first);

        codeLines.forEach((codeLine, index) => {
            editor.insertNodeByKey(
                parent.key,
                invalidNodeIndex + index,
                codeLine,
                {
                    normalize: false
                }
            );
        });

        // Remove the block
        nonLineGroup.forEach(n =>
            editor.removeNodeByKey(n.key, { normalize: false })
        );
    });

    return editor;
}

/**
 * A rule that ensure code lines only contain text
 */
function onlyTextInCode(
    opts: Options,
    editor: Editor,
    error: Object
): ?Editor {
    const { node } = editor;

    if (node.object === 'inline' || node.object === 'block') {
        node.nodes.forEach(child => {
            editor.unwrapNodeByKey(child.key, { normalize: false });
        });

        return editor;
    }

    return undefined;
}

/**
 * A rule that ensure code lines are always children
 * of a code block.
 */
function noOrphanLine(opts: Options, editor: Editor, error: Object): ?Editor {
    const { parent } = error;

    const isLine = n => n.type === opts.lineType;

    const linesGroup = getSuccessiveNodes(parent.nodes, isLine);

    linesGroup.forEach(group => {
        const container = Block.create({ type: opts.containerType, nodes: [] });
        const firstLineIndex = parent.nodes.indexOf(group.first());

        editor.insertNodeByKey(parent.key, firstLineIndex, container, {
            normalize: false
        });

        group.forEach((line, index) =>
            editor.moveNodeByKey(line.key, container.key, index, {
                normalize: false
            })
        );
    });
}

export default schema;
