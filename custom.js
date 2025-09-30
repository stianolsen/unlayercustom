<script>
// 1) Register (or curate) the fonts you want to expose.
//    Tip: keep this list curated (~20–60) for performance; you can still search it.
const CUSTOM_FONTS = [
  { label: 'Inter',       value: "'Inter', sans-serif",       url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' },
  { label: 'Roboto',      value: "'Roboto', sans-serif",      url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap' },
  { label: 'Lato',        value: "'Lato', sans-serif",        url: 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap' },
  { label: 'Montserrat',  value: "'Montserrat', sans-serif",  url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap' },
  { label: 'Merriweather',value: "'Merriweather', serif",     url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap' },
  { label: 'Playfair',    value: "'Playfair Display', serif", url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap' },
  { label: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;700&display=swap' },
  // ...add more as needed
];

// 2) A small utility to inject <link> tags for Google CSS only once.
function ensureFontCssLoaded(url) {
  if (!url) return;
  if ([...document.styleSheets].some(s => s.href === url)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

// 3) Searchable font picker as a Property Editor (React via unlayer.React).
(function () {
  const React = unlayer.React;
  const { useMemo, useState, useEffect } = React;

  function SearchableFontPicker(props) {
    const { value, updateValue, data } = props;
    const fonts = (data && data.fonts) || CUSTOM_FONTS;

    // Preload the currently selected font’s CSS if present
    useEffect(() => {
      const current = fonts.find(f => f.value === (value && value.value ? value.value : value));
      if (current && current.url) ensureFontCssLoaded(current.url);
    }, []);

    const [q, setQ] = useState('');
    const filtered = useMemo(() => {
      const term = q.trim().toLowerCase();
      if (!term) return fonts;
      return fonts.filter(f => f.label.toLowerCase().includes(term));
    }, [q, fonts]);

    function pick(font) {
      // Load the font CSS if needed, then update the Unlayer value
      ensureFontCssLoaded(font.url);
      // Unlayer expects { value: "<font stack>" } for fontFamily editor values
      updateValue({ value: font.value });
    }

    const itemStyle = {
      padding: '8px 10px',
      cursor: 'pointer',
      borderBottom: '1px solid #eee',
      fontFamily: (value && value.value) || 'inherit'
    };

    return React.createElement('div', { style: { padding: 8 } },
      React.createElement('input', {
        type: 'search',
        placeholder: 'Search fonts…',
        value: q,
        onChange: (e) => setQ(e.target.value),
        style: {
          width: '100%', padding: '8px 10px', marginBottom: 8,
          border: '1px solid #ccc', borderRadius: 6
        }
      }),
      React.createElement('div', {
        style: { maxHeight: 260, overflow: 'auto', border: '1px solid #eee', borderRadius: 6 }
      },
        ...filtered.map(font =>
          React.createElement('div', {
            key: font.value,
            onClick: () => pick(font),
            style: { ...itemStyle, fontFamily: font.value }
          }, font.label)
        ),
        filtered.length === 0 && React.createElement('div', { style: { padding: 10, color: '#777' } }, 'No matches')
      )
    );
  }

  unlayer.registerPropertyEditor({
    name: 'searchable_font_picker',
    Widget: SearchableFontPicker
  });
})();
</script>

<script>
// 4) Initialize Unlayer: wire up fonts + use the custom editor for Text.fontFamily
unlayer.init({
  id: 'editor',
  // OPTIONAL: hide default fonts so only your curated list appears in pickers
  fonts: {
    showDefaultFonts: false,
    customFonts: CUSTOM_FONTS
  },
  // OPTIONAL: enable inline font controls if you want quick access in the in-place editor
  textEditor: {
    inlineFontControls: true
  },
  tools: {
    text: {
      // Set a sensible default (must match one of your configured font values)
      properties: {
        fontFamily: {
          editor: {
            // Use our custom searchable picker (value format must be { value: "<stack>" })
            name: 'searchable_font_picker',
            // Pass the fonts list into the editor; you could also fetch this asynchronously
            data: { fonts: CUSTOM_FONTS },
            defaultValue: { value: "'Inter', sans-serif" }
          }
        }
      }
    }
  }
});
</script>
