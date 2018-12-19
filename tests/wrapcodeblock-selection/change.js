import assert from 'assert';

export default function(plugin, editor) {
    plugin.changes.wrapCodeBlock(editor);

    assert.equal(editor.value.startOffset, 5);

    return editor;
}
