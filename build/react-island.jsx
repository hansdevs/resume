// React 19 + Framer Motion islands, bundled to scripts/react-island.bundle.js.
// The vanilla site stays vanilla: this bundle only takes over elements that
// opt in with a data attribute, so pages without islands pay nothing.
//
//   <div data-react-island="hello"></div>
//   <script src="scripts/react-island.bundle.js" defer></script>
//
// Add new islands to the registry below.
import { createRoot } from 'react-dom/client';
import { motion } from 'framer-motion';

const ISLANDS = {
  hello: () => (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ fontFamily: 'monospace' }}
    >
      react island alive
    </motion.p>
  )
};

document.querySelectorAll('[data-react-island]').forEach((el) => {
  const Island = ISLANDS[el.dataset.reactIsland];
  if (Island) createRoot(el).render(<Island />);
});
