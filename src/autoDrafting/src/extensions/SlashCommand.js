// import { Extension } from '@tiptap/core'
// import Suggestion from '@tiptap/suggestion'
// import tippy from 'tippy.js'
// import 'tippy.js/dist/tippy.css'

// const SlashCommand = Extension.create({
//   name: 'slash-command',

//   addOptions() {
//     return {
//       suggestion: {
//         char: '/',
//         command: ({ editor, range, props }) => {
//           props.command({ editor, range })
//         },
//         items: ({ query }) => {
//           return [
//             { title: 'Heading 1', command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
//             { title: 'Heading 2', command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
//             { title: 'Bullet List', command: ({ editor }) => editor.chain().focus().toggleBulletList().run() },
//             { title: 'Numbered List', command: ({ editor }) => editor.chain().focus().toggleOrderedList().run() },
//             { title: 'Code Block', command: ({ editor }) => editor.chain().focus().toggleCodeBlock().run() },
//             { title: 'Paragraph', command: ({ editor }) => editor.chain().focus().setParagraph().run() },
//           ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
//         },
//         render: () => {
//           let component
//           let popup

//           return {
//             onStart: props => {
//               component = document.createElement('div')
//               component.className = 'bg-white border shadow rounded p-2 text-sm space-y-1'
//               props.items.forEach(item => {
//                 const el = document.createElement('div')
//                 el.className = 'p-1 hover:bg-gray-100 cursor-pointer rounded'
//                 el.innerText = item.title
//                 el.addEventListener('click', () => {
//                   props.command(item)
//                 })
//                 component.appendChild(el)
//               })

//               popup = tippy('body', {
//                 getReferenceClientRect: props.clientRect,
//                 appendTo: () => document.body,
//                 content: component,
//                 showOnCreate: true,
//                 interactive: true,
//                 trigger: 'manual',
//                 placement: 'bottom-start',
//               })[0]
//             },

//             onUpdate(props) {
//               while (component.firstChild) component.removeChild(component.firstChild)
//               props.items.forEach(item => {
//                 const el = document.createElement('div')
//                 el.className = 'p-1 hover:bg-gray-100 cursor-pointer rounded'
//                 el.innerText = item.title
//                 el.addEventListener('click', () => {
//                   props.command(item)
//                 })
//                 component.appendChild(el)
//               })
//               popup[0].setProps({
//                 getReferenceClientRect: props.clientRect,
//               })
//             },

//             onExit() {
//               popup?.destroy()
//             },
//           }
//         },
//       },
//     }
//   },

//   addProseMirrorPlugins() {
//     return [
//       Suggestion({
//         editor: this.editor,
//         ...this.options.suggestion,
//       }),
//     ]
//   },
// })

// export default SlashCommand


// // slash-command.js
// import { Extension } from '@tiptap/core';

// import Suggestion from '@tiptap/suggestion';


// const SlashCommand = Extension.create({
//   name: 'slash-command',

//   addExtensions() {
//     return [
//       Suggestion.configure({
//         char: '/',
//         pluginKey: 'slash-command',

//         items: ({ query }) => {
//           return [
//             {
//               title: 'Heading 1',
//               command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
//             },
//             {
//               title: 'Heading 2',
//               command: ({ editor }) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
//             },
//             {
//               title: 'Bullet List',
//               command: ({ editor }) => editor.chain().focus().toggleBulletList().run(),
//             },
//             {
//               title: 'Numbered List',
//               command: ({ editor }) => editor.chain().focus().toggleOrderedList().run(),
//             },
//             {
//               title: 'Blockquote',
//               command: ({ editor }) => editor.chain().focus().toggleBlockquote().run(),
//             },
//           ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
//         },

//         render: () => {
//           let component;
//           let popup;

//           return {
//             onStart: props => {
//               component = document.createElement('div');
//               component.className = 'slash-menu';
//               updateComponent(props);
//               document.body.appendChild(component);

//               const { from } = props.range;
//               const coords = props.editor.view.coordsAtPos(from);
//               component.style.position = 'absolute';
//               component.style.left = coords.left + 'px';
//               component.style.top = coords.bottom + 'px';
//             },

//             onUpdate: props => {
//               updateComponent(props);
//             },

//             onExit: () => {
//               if (component) {
//                 component.remove();
//               }
//             },
//           };

//           function updateComponent({ items, command }) {
//             component.innerHTML = '';
//             items.forEach(item => {
//               const div = document.createElement('div');
//               div.className = 'slash-item';
//               div.innerText = item.title;
//               div.onclick = () => command(item);
//               component.appendChild(div);
//             });
//           }
//         },
//       }),
//     ];
//   },
// });

// export default SlashCommand;


import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

const SlashCommand = Extension.create({
  name: 'slash-command',
  addExtensions() {
    return [
      Suggestion({
        char: '/',
        pluginKey: 'slash-command',
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
        items: ({ query }) => [
          {
            title: 'Heading 1',
            command: ({ editor }) =>
              editor.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            title: 'Bullet List',
            command: ({ editor }) =>
              editor.chain().focus().toggleBulletList().run(),
          },
        ].filter(item =>
          item.title.toLowerCase().includes(query.toLowerCase())
        ),
        render: () => {
          let popup

          return {
            onStart: props => {
              popup = createPopup(props)
            },
            onUpdate: props => updatePopup(popup, props),
            onExit: () => popup?.remove(),
          }

          function createPopup(props) {
            const div = document.createElement('div')
            div.className = 'absolute z-50 bg-white border rounded shadow p-2'
            document.body.appendChild(div)
            updatePopup(div, props)
            return div
          }

          function updatePopup(popup, { items, command, clientRect }) {
            popup.innerHTML = ''
            if (clientRect) {
              const { top, left } = clientRect()
              popup.style.top = `${top + window.scrollY + 25}px`
              popup.style.left = `${left + window.scrollX}px`
            }

            items.forEach(item => {
              const div = document.createElement('div')
              div.className =
                'cursor-pointer hover:bg-gray-100 px-2 py-1 rounded'
              div.textContent = item.title
              div.onclick = () => command(item)
              popup.appendChild(div)
            })
          }
        },
      }),
    ]
  },
})

export default SlashCommand
