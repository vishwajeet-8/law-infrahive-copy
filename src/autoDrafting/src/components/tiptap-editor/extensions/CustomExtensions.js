// extensions/CustomExtensions.js - Custom Tiptap Extensions
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// Custom Font Size Extension
export const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Slash Commands Extension
export const SlashCommands = Extension.create({
  name: 'slashCommands',
  
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('slashCommands'),
        state: {
          init() {
            return {
              active: false,
              range: null,
              query: '',
            };
          },
          apply(tr, prev) {
            const { selection } = tr;
            const { from, to } = selection;
            const text = tr.doc.textBetween(from - 1, to, '\0');
            
            if (text === '/') {
              return {
                active: true,
                range: { from: from - 1, to },
                query: '',
              };
            }
            
            if (prev.active) {
              const slashIndex = tr.doc.textBetween(from - 10, from, '\0').lastIndexOf('/');
              if (slashIndex !== -1) {
                const query = tr.doc.textBetween(from - 10 + slashIndex + 1, from, '\0');
                if (query.includes(' ') || query.length > 20) {
                  return { active: false, range: null, query: '' };
                }
                return {
                  active: true,
                  range: { from: from - 10 + slashIndex, to: from },
                  query,
                };
              }
            }
            
            return { active: false, range: null, query: '' };
          },
        },
        props: {
          decorations(state) {
            const { active } = this.getState(state);
            return active ? DecorationSet.empty : null;
          },
        },
      }),
    ];
  },
});