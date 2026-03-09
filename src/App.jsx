import { useState } from 'react';
import GeoportalFonatur from './GeoportalFonatur';

function App() {
  const [lang, setLang] = useState('ES');

  return <GeoportalFonatur lang={lang} setLang={setLang} />;
}

export default App;
